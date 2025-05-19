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

      if (!response.ok) return m.reply(`❌ *Failed to download GIF from API.*`);

      const gifBuffer = await response.buffer();

      // Send as GIF instead of sticker
      await sock.sendMessage(m.from, {
        video: gifBuffer,
        gifPlayback: true, // This makes it auto-play as GIF
        caption: "Here's your ATTP GIF! 🎬",
      }, { quoted: m });
    }

  } catch (err) {
    console.error('ATTP GIF Error:', err);
    m.reply(`❌ *Error:* ${err.message}`);
  }
};

export default attpCmd;
