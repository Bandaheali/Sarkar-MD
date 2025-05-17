import config from '../../config.js';
import {getSetting, setSetting} from '../../lib/settings.js';
const VoiceBotCmd = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // Your VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    const prefix = config.PREFIX;
    const body = m.body || '';
    const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'voicebot' || cmd === 'vbot') {
      if (!isAuthorized) {
        return await m.reply('*_This command is only for the bot and owner_*');
      }

      let responseMessage;

      if (text === 'on') {
        config.VOICE_BOT = true;
        setSetting('voicebot', true);
        responseMessage = '*✅ Voice BOT HAS BEEN ENABLED NOW BOT WILL REPLY WITH VOICE MESSAGES*';
      } else if (text === 'off') {
        config.VOICE_BOT = false;
        setSetting('voicebot', false);
        responseMessage = '*❌ Voice BOT HAS BEEN DISABLED NOW BOT WILL NOT REPLY WITH VOICE MESSAGES*';
      } else {
        responseMessage = `*VOICE BOT Usage:*\n\n• \`${prefix}voicebot on\`  ➜ Enable VOICE BOT\n• \`${prefix}voicebot off\` ➜ Disable VOICE BOT`;
      }

      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    }
  } catch (error) {
    console.error("VoiceBot Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default VoiceBotCmd; // Fixed export name to match the function
