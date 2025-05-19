import fetch from 'node-fetch';
import config from '../../config.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter'; // Import the library

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

      // Create a sticker with proper metadata
      const sticker = new Sticker(stickerBuffer, {
        pack: 'Sarkar-MD', // Your sticker pack name
        author: 'Bandaheali', // Your name/bot name
        type: StickerTypes.FULL, // Sticker type (FULL = with background)
        categories: ['🤩', '🎉'],
        quality: 70,
      });

      await sock.sendMessage(m.from, await sticker.toMessage(), { quoted: m });
    }

  } catch (err) {
    console.error('ATTP Sticker Error:', err);
    m.reply(`❌ *Error:* ${err.message}`);
  }
};

export default attpCmd;
