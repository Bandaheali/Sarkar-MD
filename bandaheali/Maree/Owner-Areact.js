import config from '../../config.cjs';

const autoReactCommand = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // Your VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'autoreact' || cmd === 'areact') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');

      let responseMessage;

      if (text === 'on') {
        config.AUTO_REACT = true;
        responseMessage = '*✅ AUTO REACT HAS BEEN ENABLED NOW BOT WILL REACT ON USERS MSG*';
      } else if (text === 'off') {
        config.AUTO_REACT = false;
        responseMessage = '*❌ AUTO REACT HAS BEEN ENABLED NOW BOT WILL NOT REACT ON USERS MSG*';
      } else {
        responseMessage = `*autoreact Usage:*\n\n- \`autoreact on\`  ➜ Enable Autoreact\n- \`autoreact off\` ➜ Disable Autoreact`;
      }

      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    }
  } catch (error) {
    console.error("Autoreact Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default autoReactCommand;
