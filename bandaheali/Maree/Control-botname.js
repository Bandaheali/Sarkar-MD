import config from '../../config.js';
import { getSetting, setSetting } from '../../lib/settings.js';

const BotNameCmd = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // Your VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'botname') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');

      if (!text) {
        return m.reply(`*Usage:*\n\n- \`${prefix}botname YourBotName\`\n\nExample: \`${prefix}botname SARKAR-MD\``);
      }

      config.BOT_NAME = text;
      setSetting('botname', text);

      await Matrix.sendMessage(m.from, {
        text: `*_✅ BOT NAME HAS BEEN CHANGED TO:_* *${text}*`
      }, { quoted: m });
    }
  } catch (error) {
    console.error("botname Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default BotNameCmd;
