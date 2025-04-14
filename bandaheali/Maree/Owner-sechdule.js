import moment from 'moment-timezone';
import config from '../../config.cjs';

const realTime = async (m, sock) => {
  try {
    if (!m || !sock) {
      console.error("Invalid message or socket object");
      return;
    }

    const prefix = config.PREFIX || '!'; // Fallback prefix
    const body = m.body || '';
    const cmd = body.startsWith(prefix) 
      ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() 
      : "";

    if (cmd !== "realtime") return;

    await m.react('⏳').catch(() => console.log("Failed to react ⏳"));

    const now = moment().tz(config.TIMEZONE || "Asia/Karachi"); // Configurable timezone
    const time = now.format("HH:mm:ss");
    const date = now.format("YYYY-MM-DD");
    const day = now.format("dddd");

    await sock.sendMessage(
      m.chat, 
      {
        text: `🕒 *Current Time:* ${time}\n📅 *Date:* ${date}\n📌 *Day:* ${day}`,
      }, 
      { quoted: m }
    ).catch(() => console.log("Failed to send message"));

    await m.react('✅').catch(() => console.log("Failed to react ✅"));
  } catch (error) {
    console.error("Error in realTime function:", error);
  }
};

export default realTime;
