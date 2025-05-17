import config from '../../config.js';
import {getSetting, setSetting} from '../../lib/settings.js';

const setPrefix = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // Your VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    let prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'setprefix') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');
    if (!text) return m.reply('*_Please Use Any symbol example => .setprefix +_*');
      config.PREFIX = text;
      setSetting('prefix', text);
let responseMsg = `*_PREFIX CHNAGED SUCCESSFULLY NOW MY PREFIX IS ${text}_*`
      await Matrix.sendMessage(m.from, { text: responseMsg }, { quoted: m });
    }
  } catch (error) {
    console.error("set Prefix Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default setPrefix;
