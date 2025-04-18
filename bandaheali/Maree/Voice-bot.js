import config from '../../config.cjs';
import fetch from 'node-fetch';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'path';

const ELEVENLABS_API_KEY = 'sk_f5e46959e592f2f421fcfd3de377da4c0019e60dc2b46672';
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';

const VoiceBot = async (m, Matrix) => {
  const dev = "923253617422@s.whatsapp.net";
  const chatbot = config.VOICE_BOT || false;
  const isGroup = m.key.remoteJid.endsWith("@g.us");

  // command runs here for both if mode is "both"
  const text = m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    null;
  if (!text) return;

  const bot = await Matrix.decodeJid(Matrix.user.id);
  const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
  const isAllowed = [bot, owner, dev];

  if (!chatbot) return;
  if (!m.sender || isAllowed.includes(m.sender)) return;
  if (isGroup) return;
  if (m.key.remoteJid.endsWith("@newsletter")) return;

  // Custom reply for specific questions
  if (text.toLowerCase() === 'who are you' || 
      text.toLowerCase() === 'which ai model you are' || 
      text.toLowerCase() === 'apko kisne bnaya' || 
      text.toLowerCase() === 'which ai you model you are?' || 
      text.toLowerCase() === 'ap kon ho') {
    const replyText = 'I am Sarkar, an AI created by Bandaheali. How can I help you Sir?';
    await Matrix.sendMessage(m.sender, { text: replyText }, { quoted: m });
    await convertAndSendVoice(replyText, m, Matrix);
    return;
  }

  try {
    // Get text response from chatbot API
    const response = await fetch(`https://apis-keith.vercel.app/ai/gpt?q=${encodeURIComponent(text)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const botReply = data.result || '_*SOORY SIR MAIN SMJHA NAI*_';
    
    // Send text reply first
    await Matrix.sendMessage(m.sender, { text: botReply }, { quoted: m });
    
    // Convert to voice and send
    await convertAndSendVoice(botReply, m, Matrix);

  } catch (err) {
    console.error('Error in chatbot command:', err.message);
    await Matrix.sendMessage(m.sender, { text: '❌ Failed to process your request.' }, { quoted: m });
  }
};

// Helper function to convert text to voice and send
async function convertAndSendVoice(text, message, client) {
  try {
    // Generate a unique filename
    const tempFile = `${tmpdir()}/voice_${Date.now()}.mp3`;
    
    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    // Save audio to temporary file
    const audioBuffer = await response.buffer();
    await writeFile(tempFile, audioBuffer);

    // Send voice message
    await client.sendMessage(message.sender, {
      audio: { url: tempFile },
      mimetype: 'audio/mpeg',
      ptt: true
    }, {
      quoted: message
    });

    // Clean up
    await unlink(tempFile);

  } catch (error) {
    console.error('Error in voice conversion:', error.message);
    // Don't send error to user as we already sent text reply
  }
}

export default VoiceBot;
