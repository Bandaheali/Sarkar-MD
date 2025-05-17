import config from '../../config.js';
import {getSetting, setSetting} from '../../lib/settings.js';
const heartReactCommand = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // Your VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'heartreact' || cmd === 'hreact') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');

      let responseMessage;

      if (text === 'on') {
        config.HEART_REACT = true;
        setSetting('heartreact', true);
        responseMessage = '*✅ HEART REACT HAS BEEN ENABLED NOW BOT WILL REACT ON USERS MSG*';
      } else if (text === 'off') {
        config.HEART_REACT = false;
        setSetting('heartreact', false);
        responseMessage = '*❌ HEART REACT HAS BEEN ENABLED NOW BOT WILL NOT REACT ON USERS MSG*';
      } else {
        responseMessage = `*HEART REACT Usage:*\n\n- \`heartreact on\`  ➜ Enable HEART REACT\n- \`heartreact off\` ➜ Disable HEART REACT`;
      }

      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    }
  } catch (error) {
    console.error("heartreact Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default heartReactCommand;
