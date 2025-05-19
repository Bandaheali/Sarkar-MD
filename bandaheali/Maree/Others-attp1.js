import fetch from 'node-fetch';
import config from '../../config.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const attp2Cmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'attp2') {
      if (!text) {
        return m.reply(`*❌ Please provide some text!*\n\nExample: ${prefix}attp2 Maher Zubair`);
      }

      const apiUrl = `https://api.nexoracle.com/image-creating/attp2?apikey=sarkar_786&text=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) return m.reply(`❌ *Failed to download sticker from API.*`);

      const stickerBuffer = await response.buffer();

      // Create a sticker with proper metadata
      const sticker = new Sticker(stickerBuffer, {
        pack: 'ATTP2 Sticker',
        author: 'Your Bot',
        type: StickerTypes.FULL,
        categories: ['🤩', '🎉'],
        quality: 70,
      });

      await sock.sendMessage(m.from, await sticker.toMessage(), { quoted: m });
    }

  } catch (err) {
    console.error('ATTP2 Sticker Error:', err);
    m.reply(`❌ *Error:* ${err.message}`);
  }
};

export default attp2Cmd;
