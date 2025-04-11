import config from '../../config.cjs';

const antiCall = async (m, Matrix) => {
const bot = await Matrix.decode.jid(Matrix.user.id);
const dev = '923253617422@s.whatsapp.net';
const Creater = [bot, dev, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
const prefix = config.PREFIX;
const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : "";

const text = m.body.slice(prefix.length + cmd.length).trim();

if(cmd === 'anticall') {
if(!Creater) return m.reply("*_THIS COMMAND IS ONLY FOR BOT AND OWNER_*");

let responceMsg;
if (text === 'on') {
config.REJECT_CALL = true;
responceMsg = "antiCall has been enabled";
} else if (text === 'off') {
config.REJECT_CALL = false;
responceMsg = "*_AntiCall has been Disabled_*";
} else {
responceMsg = "usage:\n 'anticall on` : enable antiCall\n`anticall off`: DisAble antiCall";
}

try { 
      await Matrix.sendMessage(m.from, {text: responceMsg }, {quoted: m });
      } catch (error) {
      await Matrix.sendMessage(m.from, { text: 'error processing your request' }, { quoted: m });
      }
      }
      };
      
      export default antiCall;

