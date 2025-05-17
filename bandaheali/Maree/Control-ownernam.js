import config from '../../config.js';
import { setSetting } from '../../lib/settings.js';

const EditOwnerCmd = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'editowner') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');

      if (!text) {
        return m.reply(`*Usage:*\n\n\`${prefix}editowner Bandaheali\`\n_Update the OWNER name shown in bot menu/messages_`);
      }

      config.OWNER_NAME = text;
      setSetting('ownername', text);

      await Matrix.sendMessage(m.from, {
        text: `*✅ Owner name has been updated to:* ${text}`,
      }, { quoted: m });
    }
  } catch (err) {
    console.error('EditOwner Command Error:', err);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while updating the owner name.*' }, { quoted: m });
  }
};

export default EditOwnerCmd;
