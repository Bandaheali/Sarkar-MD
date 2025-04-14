import moment from 'moment-timezone';
import config from '../../config.cjs';

const realTime = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : "";

  const realtime = moment().tz("Asia/Karachi").format("HH:mm:ss");

  if (cmd === "realtime") {
    await m.react('⏳');
    
    await m.react('✅'); 
    
    await sock.sendMessage(m.chat, { text: `Current Time: ${realtime}` }, { quoted: m });
  }
};

export default realTime;
