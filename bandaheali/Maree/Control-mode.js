import config from '../../config.js';
import { getSetting, setSetting } from '../../lib/settings.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const modeCommand = async (m, Matrix) => {
  try {
    const dev = '923253617422@s.whatsapp.net';
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'mode') {
      if (!isCreator) {
        await sendNewsletter(Matrix, m.from, '*🚫 This command is only for the bot and owner*', {
          quoted: m,
          title: '⚠️ Command Restricted',
          body: 'Authorization Required'
        });
        return;
      }

      let responseMessage;
      let title = '🚀 Bot Mode Settings';
      let body = 'Mode Updated';

      if (text === 'public') {
        config.MODE = "public";
        Matrix.public = true;
        setSetting('mode', "public");
        responseMessage = '*✅ Mode changed to PUBLIC*\n_Bot will now respond to everyone._';
        body = 'Switched to Public Mode';
      } else if (text === 'private') {
        config.MODE = "private";
        Matrix.public = false;
        setSetting('mode', "private");
        responseMessage = '*🔒 Mode changed to PRIVATE*\n_Bot will now respond to owner only._';
        body = 'Switched to Private Mode';
      } else {
        responseMessage = `*📌 Mode Usage:*\n\n• \`${prefix}mode public\`  ➜ _Bot responds to everyone_\n• \`${prefix}mode private\` ➜ _Bot responds only to owner_`;
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
    await sendNewsletter(Matrix, m.from, '*⚠️ An error occurred while processing your request*', {
      quoted: m,
      title: '❌ System Error',
      body: 'Command Failed'
    });
  }
};

export default modeCommand;
