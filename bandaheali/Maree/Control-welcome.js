import config from '../../config.js';
import { setSetting, getSetting } from '../../lib/settings.js';

const gcEvent = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const dev = '923253617422@s.whatsapp.net';
  const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
  const bot = await Matrix.decodeJid(Matrix.user.id);
  const isCreater = [dev, owner, bot].includes(m.sender);
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'welcome') {
    if (!isCreater) return m.reply("*📛 THIS COMMAND IS ONLY FOR OWNER AND BOT*");

    let responseMessage;
    switch (text) {
      case 'on':
      config.WELCOME = true;
        setSetting('welcome', true);
        responseMessage = "✅ WELCOME and LEFT system has been *enabled globally*.";
        break;
      case 'off':
      config.WELCOME = false;
        setSetting('welcome', false);
        responseMessage = "❌ WELCOME and LEFT system has been *disabled globally*.";
        break;
      default:
        responseMessage = "Usage:\n- `WELCOME on`: Enable globally\n- `WELCOME off`: Disable globally";
    }

    await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
  }
};

export default gcEvent;
