import config from '../../config.cjs';

const antiCallCommand = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // Your VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'anticall') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');

      let responseMessage;

      if (text === 'on') {
        config.REJECT_CALL = true;
        responseMessage = '*✅ Anti-Call system has been enabled!*';
      } else if (text === 'off') {
        config.REJECT_CALL = false;
        responseMessage = '*❌ Anti-Call system has been disabled!*';
      } else {
        responseMessage = `*Anti-Call Usage:*\n\n- \`anticall on\`  ➜ Enable Anti-Call\n- \`anticall off\` ➜ Disable Anti-Call`;
      }

      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    }
  } catch (error) {
    console.error("AntiCall Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default antiCallCommand;
