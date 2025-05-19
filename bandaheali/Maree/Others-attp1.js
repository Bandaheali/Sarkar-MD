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
        return m.reply(`*❌ Please enter text to convert!*\nExample: ${prefix}attp Bandaheali`);
      }

      const api = `https://api.nexoracle.com/image-creating/attp?apikey=sarkar_786&text=${encodeURIComponent(text)}`;
      const res = await fetch(api);

      if (!res.ok) {
        return m.reply(`❌ Failed to generate sticker. API error.`);
      }

      const gifBuffer = await res.buffer();

      await sock.sendMessage(m.from, {
        sticker: gifBuffer,
      }, { quoted: m });
    }
  } catch (err) {
    console.error(err);
    m.reply('*❌ Error while generating sticker.*');
  }
};

export default attpCmd;
