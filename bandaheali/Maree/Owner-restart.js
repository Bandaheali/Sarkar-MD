import config from '../../config.cjs';

const restartBot = async (m, sock) => {
  const ownerNumber = config.OWNER_NUMBER.replace(/[^0-9]/g, ""); // Owner number cleanup
  const senderNumber = m.sender.split('@')[0]; // Sender number cleanup

  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd !== "restart") return; // Ignore if not the restart command

  if (senderNumber !== ownerNumber) {
    return await sock.sendMessage(m.from, { text: "❌ *Only the Owner can restart the bot!*" }, { quoted: m });
  }

  await sock.sendMessage(m.from, {
    text: "🔄 *Restarting... Please wait!*",
  }, { quoted: m });

  console.log("🛠 Restarting bot...");
  process.exit(1); // ✅ Exit process (PM2/Termux will auto-restart)
};

export default restartBot;
