import Sarkar from '../../config.js';
import { getSetting, setSetting } from '../../lib/settings.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const modeCommand = async (m, Matrix) => {
  try {
    const dev = '923253617422@s.whatsapp.net';
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isCreator = [botNumber, Sarkar.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);
    const prefix = Sarkar.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim().toLowerCase();

    if (cmd === 'mode') {
      if (!isCreator) {
        await sendNewsletter(Matrix, m.from, '*🚫 This command is only for the bot owner*', {
          quoted: m,
          title: '⚠️ Command Restricted',
          body: 'Owner Only'
        });
        return;
      }

      let responseMessage;
      let title = '✨ Bot Mode Settings ✨';
      let body = 'System Configuration';

      if (text === 'public') {
        Sarkar.MODE = "public";
        Matrix.public = true;
        setSetting('mode', "public");
        responseMessage = '*🌐 Mode Changed to PUBLIC*\n_Bot is now accessible to everyone_';
        body = 'Public Mode Activated';
      } else if (text === 'private') {
        Sarkar.MODE = "private";
        Matrix.public = false;
        setSetting('mode', "private");
        responseMessage = '*🔒 Mode Changed to PRIVATE*\n_Bot is now restricted to owner only_';
        body = 'Private Mode Activated';
      } else if (text === 'view' || text === 'status') {
        const currentMode = getSetting('mode') || Sarkar.MODE || 'public';
        responseMessage = `*📊 Current Bot Mode:* ${currentMode.toUpperCase()}`;
        title = 'ℹ️ Mode Status';
        body = 'Current Configuration';
      } else {
        responseMessage = `*📌 Mode Command Usage:*\n\n• \`${prefix}mode public\`  ➜ _Enable Public Mode_\n• \`${prefix}mode private\` ➜ _Enable Private Mode_\n• \`${prefix}mode view\` ➜ _Check Current Mode_`;
        title = 'ℹ️ Mode Help';
        body = 'Command Guide';
      }

      await sendNewsletter(Matrix, m.from, responseMessage, {
        quoted: m,
        title: title,
        body: body
      });
    }
  } catch (error) {
    console.error("Mode Command Error:", error);
    await sendNewsletter(Matrix, m.from, '*⚠️ Failed to change bot mode*', {
      quoted: m,
      title: '❌ System Error',
      body: 'Command Failed'
    });
  }
};

export default modeCommand;
