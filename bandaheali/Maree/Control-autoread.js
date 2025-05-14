import config from '../../config.cjs';

const AutoRead = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // Your VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'autoread' || cmd === 'read') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');

      let responseMessage;

      if (text === 'on') {
        config.AUTO_Read = true;
        responseMessage = '*_✅ AUTO_READ HAS BEEN ENABLED NOW BOT WILL SEEN ALL MSGS_*';
      } else if (text === 'off') {
        config.AUTO_READ = false;
        responseMessage = '*_❌ AUTO_READ HAS BEEN DISABLED NOW BOT WILL NOT SEEN ALL MSGS_*';
      } else {
        responseMessage = `*PM BLOCK Usage:*\n\n- \`pmblock on\`  ➜ Enable PM_BLOCK\n- \`pmblock off\` ➜ Disable PM_BLOCK`;
      }

      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    }
  } catch (error) {
    console.error("heartreact Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default AutoRead;
