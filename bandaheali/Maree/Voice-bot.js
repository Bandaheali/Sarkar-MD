import config from '../../config.js';
import fetch from 'node-fetch';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'path';

const ELEVENLABS_API_KEY = 'sk_f5e46959e592f2f421fcfd3de377da4c0019e60dc2b46672';
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';

const VoiceBot = async (m, Matrix) => {
  try {
    // Check if voice bot is enabled in config
    if (!config.VOICE_BOT) return;

    const dev = "923253617422@s.whatsapp.net";
    const isGroup = m.key.remoteJid.endsWith("@g.us");

    // Get message text
    const text = m.message?.conversation ||
                m.message?.extendedTextMessage?.text ||
                m.message?.imageMessage?.caption ||
                null;
    
    if (!text) return;

    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
    const isAllowed = [botNumber, owner, dev];

    // Check permissions
    if (!m.sender || isAllowed.includes(m.sender)) return;
    if (isGroup) return;
    if (m.key.remoteJid.endsWith("@newsletter")) return;

    // Custom replies
    const customReplies = {
      'who are you': 'I am Sarkar, an AI created by Bandaheali. How can I help you Sir?',
      'which ai model you are': 'I am Sarkar, an AI created by Bandaheali. How can I help you Sir?',
      'apko kisne bnaya': 'I am Sarkar, an AI created by Bandaheali. How can I help you Sir?',
      'which ai you model you are?': 'I am Sarkar, an AI created by Bandaheali. How can I help you Sir?',
      'ap kon ho': 'I am Sarkar, an AI created by Bandaheali. How can I help you Sir?'
    };

    const lowerText = text.toLowerCase();
    if (customReplies.hasOwnProperty(lowerText)) {
      const replyText = customReplies[lowerText];
      await convertAndSendVoice(replyText, m, Matrix);
      return;
    }

    // Get response from chatbot API
    const apiResponse = await fetch(`https://apis-keith.vercel.app/ai/gpt?q=${encodeURIComponent(text)}`);
    if (!apiResponse.ok) throw new Error(`API error: ${apiResponse.status}`);

    const data = await apiResponse.json();
    const botReply = data.result || 'Sorry, I did not understand that.';

    // Convert and send voice reply only (no text reply)
    await convertAndSendVoice(botReply, m, Matrix);

  } catch (error) {
    console.error('VoiceBot Error:', error);
    await convertAndSendVoice('An error occurred while processing your message.', m, Matrix);
  }
};

// Voice conversion function
async function convertAndSendVoice(text, message, client) {
  let tempFile;
  try {
    tempFile = `${tmpdir()}/voice_${Date.now()}.mp3`;
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v2",
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.5,
          speaker_boost: true
        }
      }),
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API responded with ${response.status}`);
    }

    const audioBuffer = await response.buffer();
    await writeFile(tempFile, audioBuffer);

    await client.sendMessage(message.sender, {
      audio: { url: tempFile },
      mimetype: 'audio/mpeg',
      ptt: true,
      waveform: [100, 0, 100, 0, 100]
    }, {
      quoted: message
    });

  } catch (error) {
    console.error('Voice Conversion Error:', error);
    // Fallback to text if voice conversion fails
    await client.sendMessage(message.sender, 
      { text: 'Error: Could not generate voice response. Please try again later.' }, 
      { quoted: message }
    );
  } finally {
    if (tempFile) {
      try {
        await unlink(tempFile);
      } catch (cleanupError) {
        console.error('Failed to clean up temp file:', cleanupError);
      }
    }
  }
}

export default VoiceBot;
