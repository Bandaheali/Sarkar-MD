import config from '../../config.js';
import { getSetting, setSetting } from '../../lib/settings.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const StatusLikeCmd = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'statuslike') {
      if (!isAuthorized) {
        await sendNewsletter(Matrix, m.from, '*🚫 This command is only for the bot and owner*', {
          quoted: m,
          title: '⚠️ Command Restricted',
          body: 'Authorization Required'
        });
        return;
      }

      let responseMessage;
      let title = '✨ Status Like Settings ✨';
      let body = 'Interaction Update';

      if (text === 'on') {
        config.AUTO_STATUS_LIKE = true;
        setSetting('statuslike', true);
        responseMessage = '*✅ Auto Status Like has been enabled*\n_Bot will now automatically like status updates_';
        body = 'Status Liker Activated';
      } else if (text === 'off') {
        config.AUTO_STATUS_LIKE = false;
        setSetting('statuslike', false);
        responseMessage = '*❌ Auto Status Like has been disabled*\n_Bot will stop liking status updates_';
        body = 'Status Liker Deactivated';
      } else if (text === 'view') {
        const currentStatus = getSetting('statuslike') ? 'Enabled' : 'Disabled';
        responseMessage = `*📊 Current Status Like Setting:* ${currentStatus}`;
        title = 'ℹ️ StatusLike Status';
        body = 'Current Configuration';
      } else {
        responseMessage = `*📌 Status Like Usage:*\n\n• \`${prefix}statuslike on\`  ➜ _Enable Auto Liking_\n• \`${prefix}statuslike off\` ➜ _Disable Auto Liking_\n• \`${prefix}statuslike view\` ➜ _Check Current Setting_`;
        title = 'ℹ️ StatusLike Help';
        body = 'Command Guide';
      }

      await sendNewsletter(Matrix, m.from, responseMessage, {
        quoted: m,
        title: title,
        body: body
      });
    }
  } catch (error) {
    console.error("StatusLike Command Error:", error);
    await sendNewsletter(Matrix, m.from, '*⚠️ An error occurred while processing your request*', {
      quoted: m,
      title: '❌ System Error',
      body: 'Command Failed'
    });
  }
};

export default StatusLikeCmd;
