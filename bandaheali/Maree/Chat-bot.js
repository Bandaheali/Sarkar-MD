import config from '../../config.cjs';
import fetch from 'node-fetch';

const chatbotCommand = async (m, Matrix) => {
  const dev = "923253617422@s.whatsapp.net";
  const chatbot = config.CHAT_BOT || false;

  const text = m.message?.conversation
    || m.message?.extendedTextMessage?.text
    || m.message?.imageMessage?.caption
    || null;
  if (!text) return;

  const pushName = m.pushName || "USER";

  const bot = await Matrix.decodeJid(Matrix.user.id);
  const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
  const isAllowed = [bot, owner, dev];

  if (!chatbot) return;
  if (!m.sender || isAllowed.includes(m.sender)) return;
  if (m.key.remoteJid.endsWith("@g.us")) return;
  if (m.key.remoteJid.endsWith("@newsletter")) return;

  try {
    const response = await fetch(`https://bk9.fun/ai/chataibot?q=${encodeURIComponent(text)}`);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const botReply = data.BK9 || 'No response received from BK9 API';

    const formattedReply = `👾 SARKAR-MD AI ASSISTANT 🤖\n\nHello ${pushName},\n\n${botReply}`;
    await Matrix.sendMessage(m.sender, { text: formattedReply }, { quoted: m });

  } catch (err) {
    console.error('Error fetching AI response:', err.message);
    await Matrix.sendMessage(m.sender, { text: '❌ Failed to fetch response from the BK9 server.' }, { quoted: m });
  }
};

export default chatbotCommand;
