import fetch from 'node-fetch';
import config from '../../config.js';

const simCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const owner = config.OWNER_NUMBER;
    const dev = "923253617422@s.whatsapp.net";
    const bot = await sock.decodeJid(sock.user.id);
    
    // Ensure all numbers are in correct JID format
    const allowedUsers = [
      owner.includes('@s.whatsapp.net') ? owner : `${owner}@s.whatsapp.net`,
      dev,
      bot
    ].map(num => num.toLowerCase());

    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    let number = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'sim') {
      // Convert sender to lowercase for consistent comparison
      const sender = m.sender.toLowerCase();
      
      if (!allowedUsers.includes(sender)) {
        return m.reply('❌ *Access Denied!* This command is only for bot owner/dev.');
      }

      // Remove any non-digit characters
      number = number.replace(/\D/g, '');

      // Validate number format
      if (!number || !(
        (number.startsWith('3') && number.length === 10) || // 3XXXXXXXXX (10 digits)
        (number.startsWith('0') && number.length === 11)   // 0XXXXXXXXXX (11 digits)
      )) {
        return m.reply(`*❌ Invalid Pakistani Number Format!*\n\nExamples:\n${prefix}sim 3001234567 (10 digits starting with 3)\n${prefix}sim 03001234567 (11 digits starting with 0)`);
      }

      // If number starts with 0, remove it for API query
      const apiNumber = number.startsWith('0') ? number.substring(1) : number;

      const apiUrl = `https://api.nexoracle.com/details/pak-sim-database-free?apikey=sarkar_786&q=${apiNumber}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        return m.reply('❌ *API Error* - Failed to fetch SIM details');
      }

      const data = await response.json();

      if (data.status !== 200 || !data.result) {
        return m.reply('❌ *No data found* for this number');
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
    m.reply(`❌ *Error:* ${err.message}\n\nPlease try again later.`);
  }
};

export default simCmd;
