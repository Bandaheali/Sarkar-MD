import fetch from 'node-fetch';
import config from '../../config.js';

const attpCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'attp') {
      if (!text) {
        return m.reply(`*❌ Please provide some text!*\n\nExample: ${prefix}attp Bandaheali`);
      }

      const apiUrl = `https://api.nexoracle.com/image-creating/attp?apikey=sarkar_786&text=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) return m.reply(`❌ *Failed to download sticker from API.*`);

      const stickerBuffer = await response.buffer();

      await sock.sendMessage(m.from, {
        sticker: stickerBuffer,
      }, { quoted: m });
    }

  } catch (err) {
    console.error('ATTP Sticker Error:', err);
    m.reply(`❌ *Error:* ${err.message}`);
  }
};

export default attpCmd;
