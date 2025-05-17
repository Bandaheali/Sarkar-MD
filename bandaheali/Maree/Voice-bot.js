import config from '../../config.js';
import fetch from 'node-fetch';

const chatbotCommand = async (m, Matrix) => {
  const dev = "923253617422@s.whatsapp.net";
  const isGroup = m.key.remoteJid.endsWith("@g.us");

  const text = m.message?.conversation
    || m.message?.extendedTextMessage?.text
    || m.message?.imageMessage?.caption
    || null;
  if (!text) return;

  const bot = await Matrix.decodeJid(Matrix.user.id);
  const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
  const isAllowed = [bot, owner, dev];

  // NEW: Check only VOICE_BOT is true, no chatbot setting
  if (!config.VOICE_BOT) return;
  if (!m.sender || isAllowed.includes(m.sender)) return;
  if (isGroup) return;
  if (m.key.remoteJid.endsWith("@newsletter")) return;

  // Custom replies
  const lower = text.toLowerCase();
  if (
    lower === 'who are you' || lower === 'which ai model you are' ||
    lower === 'apko kisne bnaya' || lower === 'which ai you model you are?' ||
    lower === 'ap kon ho'
  ) {
    return await Matrix.sendMessage(m.sender, {
      text: 'I am Sarkar, an AI created by Bandaheali. How can I help you Sir?'
    }, { quoted: m });
  }

  try {
    // Fetch AI reply
    const res = await fetch(`https://apis-keith.vercel.app/ai/gpt?q=${encodeURIComponent(text)}`);
    if (!res.ok) throw new Error(`GPT API Error: ${res.status}`);
    const json = await res.json();
    if (!json.status) throw new Error('GPT response status: false');

    const botReply = json.result || 'Sorry sir, I did not understand.';

    // TTS conversion & send as voice
    const ttsUrl = `https://bk9.fun/tools/tts?q=${encodeURIComponent(botReply)}&lang=en`;

    await Matrix.sendMessage(m.sender, {
      audio: { url: ttsUrl },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: m });

  } catch (err) {
    console.error('ChatBot Error:', err.message);
    await Matrix.sendMessage(m.sender, {
      text: '❌ Failed to get AI response or TTS audio.'
    }, { quoted: m });
  }
};

export default chatbotCommand;
