import config from '../../config.js';
import { setSetting } from '../../lib/settings.js';

const EditNumCmd = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim().replace(/[^0-9]/g, '');

    if (cmd === 'editnum') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');

      if (!text || text.length < 10) {
        return m.reply(`*Usage:*\n\n\`${prefix}editnum 923456789012\`\n_Update the OWNER number (without @s.whatsapp.net)*`);
      }

      config.OWNER_NUMBER = text;
      setSetting('ownernumber', text);

      await Matrix.sendMessage(m.from, {
        text: `*✅ Owner number has been updated to:* ${text}`,
      }, { quoted: m });
    }
  } catch (err) {
    console.error('EditNum Command Error:', err);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while updating the owner number.*' }, { quoted: m });
  }
};

export default EditNumCmd;
