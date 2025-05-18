import fetch from 'node-fetch';
import config from '../../config.js';

const ccCheckCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    const ccRaw = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'cc' || cmd === 'cccheck') {
      if (!ccRaw) {
        return m.reply(`*❌ Enter a CC to check!*\nExample: ${prefix}cc 5154620086381074|04|2027|672`);
      }

      const url = `https://www.dark-yasiya-api.site/other/cc-check?cc=${encodeURIComponent(ccRaw)}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!json || !json.result || !json.result.card) {
        return m.reply('*❌ Failed to check the card.*');
      }

      const data = json.result;
      const card = data.card;

      const resultMsg = `*💳 CC Checker Result*\n\n` +
        `*➤ Status:* ${data.status === 'Live' ? '✅ Live' : '❌ Die'}\n` +
        `*➤ Message:* ${data.message}\n\n` +
        `*➤ Card:* ${card.card}\n` +
        `*➤ Bank:* ${card.bank || 'Unknown'}\n` +
        `*➤ Type:* ${card.type}\n` +
        `*➤ Brand:* ${card.brand}\n` +
        `*➤ Category:* ${card.category}\n\n` +
        `*➤ Country:* ${card.country.name} ${card.country.emoji}\n` +
        `*➤ Currency:* ${card.country.currency}\n`;

      await sock.sendMessage(m.from, { text: resultMsg }, { quoted: m });
    }
  } catch (err) {
    console.error(err);
    m.reply('*❌ Error while checking CC.*');
  }
};

export default ccCheckCmd;
