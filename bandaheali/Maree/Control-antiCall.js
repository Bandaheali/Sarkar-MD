import config from '../../config.js';
import { getSetting, setSetting } from '../../lib/settings.js';

const AntiCallCmd = async (m, Matrix) => {
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
        setSetting('antiCall', true);
        responseMessage = '*✅ Anti Call has been enabled. Incoming calls will be automatically rejected.*';
      } else if (text === 'off') {
        config.REJECT_CALL = false;
        setSetting('antiCall', false);
        responseMessage = '*❌ Anti Call has been disabled. Calls will not be rejected.*';
      } else {
        responseMessage = `*Anti Call Usage:*\n\n- \`${prefix}anticall on\`  ➜ Enable Auto Reject for Calls\n- \`${prefix}anticall off\` ➜ Disable Auto Reject for Calls`;
      }

      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    }
  } catch (error) {
    console.error("anticall Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default AntiCallCmd;
