import config from '../../config.js';
import {getSetting, setSetting} from '../../lib/settings.js';

const TypingCommand = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // Your VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'typing') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');

      let responseMessage;

      if (text === 'on') {
        config.AUTO_TYPING = true;
        setSetting('typing', true);
        responseMessage = '*✅ AUTO TYPING system has been enabled!*';
      } else if (text === 'off') {
        config.AUTO_TYPING = false;
        setSetting('typing', false);
        responseMessage = '*❌ AUTO TYPING system has been disabled!*';
      } else {
        responseMessage = `*Auto_typing Usage:*\n\n- \`typing on\`  ➜ Enable AUTO TYPING\n- \`typing off\` ➜ Disable AUTO TYPING`;
      }

      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    }
  } catch (error) {
    console.error("AUTO TYPING Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default TypingCommand;
