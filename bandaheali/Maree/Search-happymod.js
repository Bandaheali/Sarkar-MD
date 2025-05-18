import fetch from 'node-fetch';
import config from '../../config.js';

const happyModCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'happymod') {
      if (!query) {
        return m.reply(`*❌ Enter a search query!*\nExample: ${prefix}happymod gta vice city`);
      }

      const api = `https://www.dark-yasiya-api.site/search/happymode?text=${encodeURIComponent(query)}`;
      const res = await fetch(api);
      const json = await res.json();

      if (!json.status || !json.result || json.result.length === 0) {
        return m.reply(`❌ No results found for: *${query}*`);
      }

      const topResults = json.result.slice(0, 10); // Top 10 apps
      let msg = `*🔎 HappyMod Results for:* _${query}_\n\n`;

      topResults.forEach((app, index) => {
        msg += `*${index + 1}. ${app.name}*\n`;
        msg += `┗ 📦 Version: _${app.version}_\n`;
        msg += `┗ 🔗 [Download Here](${app.url})\n\n`;
      });

      await sock.sendMessage(m.from, { text: msg }, { quoted: m });
    }
  } catch (err) {
    console.error(err);
    m.reply('*❌ Error fetching HappyMod data.*');
  }
};

export default happyModCmd;
