import fetch from 'node-fetch';
import config from '../../config.js';

const simCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
const owner = config.OWNER_NUMBER;
    const dev = "923253617422@s.whatsapp.net";
    const bot = await sock.decodeJid(sock.user.id);
const allowedUsers = [bot, dev, owner];

    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    const number = m.body.slice(prefix.length + cmd.length).trim();

    // Check if user is owner/dev
    


    if (cmd === 'sim') {
      if (!allowedUsers.includes(m.sender)) {
        return m.reply('❌ *Access Denied!* This command is only for bot owner/dev.');
      }

      if (!number || !/^\d{11}$/.test(number)) {
        return m.reply(`*❌ Invalid Number!*\n\nExample: ${prefix}sim 3003238250`);
      }

      const apiUrl = `https://api.nexoracle.com/details/pak-sim-database-free?apikey=sarkar_786&q=${number}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status !== 200) {
        return m.reply('❌ *Error fetching SIM details*');
      }

      const result = data.result;
      const replyMsg = `📱 *SIM Database Result*\n
🔢 *Number:* ${result.number || 'N/A'}
👤 *Name:* ${result.name || 'N/A'}
🆔 *CNIC:* ${result.cnic || 'N/A'}
🏠 *Address:* ${result.address || 'N/A'}
📶 *Operator:* ${result.operator || 'N/A'}
\n_🔒 Powered by ${config.BOT_NAME || 'SARKAR-MD'}_`;

      await sock.sendMessage(m.from, { text: replyMsg }, { quoted: m });
    }

  } catch (err) {
    console.error('SIM Command Error:', err);
    m.reply(`❌ *Error:* ${err.message}`);
  }
};

export default simCmd;
