import config from '../../config.cjs';

const AonlineCommand = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // Your VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'alwaysonline' || cmd === 'aonline') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');

      let responseMessage;

      if (text === 'on') {
        config.ALWAYS_ONLINE = true;
        responseMessage = '*✅ ALWAYS-ONLINE system has been enabled!*';
      } else if (text === 'off') {
        config.ALWAYS_ONLINE = false;
        responseMessage = '*❌ ALWAYS-ONLINE system has been disabled!*';
      } else {
        responseMessage = `*ALWAYS-ONLINE Usage:*\n\n- \`alwaysonline on\`  ➜ Enable ALWAYS-ONLINE\n- \`alwaysonline off\` ➜ Disable ALWAYS-ONLINE`;
      }

      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    }
  } catch (error) {
    console.error("Auto Recodinf Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default AonlineCommand;
