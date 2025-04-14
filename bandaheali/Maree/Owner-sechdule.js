import moment from 'moment-timezone';
import config from '../../config.cjs';

const realTime = async (m, sock) => {
  try {
    console.log("[DEBUG] realTime function triggered"); // Debug log

    // Validate required parameters
    if (!m || !sock) {
      console.error("[ERROR] Invalid message or socket object");
      return;
    }

    const prefix = config.PREFIX || '!'; // Fallback prefix
    const body = m.body || '';
    console.log(`[DEBUG] Received message: "${body}"`); // Log the incoming message

    // Extract command
    const cmd = body.startsWith(prefix) 
      ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() 
      : "";
    
    console.log(`[DEBUG] Extracted command: "${cmd}"`); // Log the extracted command

    if (cmd !== "realtime") {
      console.log(`[DEBUG] Command "${cmd}" does not match "realtime". Exiting.`);
      return;
    }

    // React with "⏳" to indicate processing
    await m.react('⏳').catch((e) => console.error("[ERROR] React ⏳ failed:", e));

    // Get current time in configured timezone
    const timezone = config.TIMEZONE || "Asia/Karachi";
    console.log(`[DEBUG] Using timezone: ${timezone}`); // Log timezone
    const now = moment().tz(timezone);

    const time = now.format("HH:mm:ss");
    const date = now.format("YYYY-MM-DD");
    const day = now.format("dddd");

    console.log(`[DEBUG] Time data - Time: ${time}, Date: ${date}, Day: ${day}`); // Log time data

    // Send the time information
    await sock.sendMessage(
      m.chat, 
      {
        text: `🕒 *Current Time:* ${time}\n📅 *Date:* ${date}\n📌 *Day:* ${day}`,
      }, 
      { quoted: m }
    ).catch((e) => console.error("[ERROR] Failed to send message:", e));

    // React with "✅" to indicate success
    await m.react('✅').catch((e) => console.error("[ERROR] React ✅ failed:", e));

    console.log("[DEBUG] realTime function completed successfully"); // Debug log
  } catch (error) {
    console.error("[CRITICAL ERROR] in realTime function:", error); // Detailed error log
  }
};

export default realTime;
