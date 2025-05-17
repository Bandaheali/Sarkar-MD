import config from '../../config.js';
import { getSetting, setSetting } from '../../lib/settings.js';

const MenuImageCmd = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // Your VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'menuimg') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');

      // Basic URL validation
      const urlRegex = /^(https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif))$/i;
      if (!text || !urlRegex.test(text)) {
        return m.reply(`*_❌ Invalid or missing URL!_*\n\n*Please provide a valid image URL (ending in .jpg, .png, etc).*\n\nExample:\n\`${prefix}menuimg https://example.com/image.jpg\``);
      }

      config.MENU_IMAGE = text;
      setSetting('menuimage', text);

      await Matrix.sendMessage(m.from, {
        text: `*_✅ MENU IMAGE HAS BEEN UPDATED SUCCESSFULLY!_*\n*New Image URL:* ${text}`
      }, { quoted: m });
    }
  } catch (error) {
    console.error("menuimg Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default MenuImageCmd;
