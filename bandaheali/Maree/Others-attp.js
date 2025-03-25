import config from '../../config.cjs';
import axios from 'axios';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const attp = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "attp") {
    try {
      const args = m.body.slice(prefix.length + cmd.length).trim();
      if (!args) {
        await sock.sendMessage(
          m.from,
          { text: "*Please provide text!*" },
          { quoted: m }
        );
        return;
      }

      await m.React('🪀');

      // Using plain text (remove if you want styled text)
      const text = args;
      
      // Fetch GIF from API
      const gifBuffer = await fetchGif(`https://api.nexoracle.com/image-creating/attp?apikey=2f9b02060a600d6c88&text=${encodeURIComponent(text)}`);
      
      // Convert to sticker
      const sticker = await createSticker(gifBuffer, {
        pack: 'ATTP Sticker',
        author: 'Your Bot',
        type: StickerTypes.FULL,
        categories: ['🤩', '🎉'],
        quality: 70
      });

      await sock.sendMessage(
        m.from,
        { sticker: sticker },
        { quoted: m }
      );

      await m.React('✅');
    } catch (error) {
      await sock.sendMessage(
        m.from,
        { text: `❌ Error: ${error.message}` },
        { quoted: m }
      );
      await m.React('❌');
    }
  }
};

// Helper function to fetch GIF
async function fetchGif(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return response.data;
}

// Helper function to create sticker
async function createSticker(buffer, options) {
  const sticker = new Sticker(buffer, options);
  return await sticker.toBuffer();
}

export default attp;
