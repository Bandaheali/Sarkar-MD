import fetch from 'node-fetch';
import config from '../../config.js';

const fancyCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'fancy') {
      if (!text) {
        return m.reply(`*❌ Please provide some text!*\nExample: ${prefix}fancy Bandaheali`);
      }

      const api = `https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(text)}`;
      const res = await fetch(api);
      const json = await res.json();

      if (!json || !json.result) {
        return m.reply('*❌ Failed to fetch fancy fonts!*');
      }

      const allFonts = json.result;
      let msg = `*✨ Fancy Text Generator Result*\n\n`;

      for (let i = 0; i < allFonts.length; i++) {
        msg += `*${i + 1} ➜* ${allFonts[i]}\n`;
      }

      await sock.sendMessage(m.from, { text: msg }, { quoted: m });
    }
  } catch (err) {
    console.error(err);
    m.reply('*❌ Error while fetching fancy fonts.*');
  }
};

export default fancyCmd;
