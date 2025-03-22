import fs from 'fs';
import dotenv from 'dotenv';
import config from '../../config.cjs';

dotenv.config(); // Load .env file

const configUpdate = async (m, sock) => {
  const ownerNumber = config.OWNER_NUMBER.replace(/[^0-9]/g, ""); // Owner number clean
  const senderNumber = m.sender.split('@')[0]; // Sender number clean

  const prefix = config.PREFIX;
  const cmdArgs = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ') : [];

  if (cmdArgs[0].toLowerCase() === "editvar") {
    if (senderNumber !== ownerNumber) {
      return await sock.sendMessage(m.from, { text: "❌ *Only the Owner can update settings!*" }, { quoted: m });
    }

    if (cmdArgs.length < 3) {
      return await sock.sendMessage(m.from, { text: "⚠️ *Usage:* `.configupdate AUTO_STATUS_SEEN true/false`" }, { quoted: m });
    }

    const settingKey = cmdArgs[1].toUpperCase(); // Setting name (e.g., AUTO_STATUS_SEEN)
    const settingValue = cmdArgs[2].toLowerCase() === 'true'; // Convert to boolean

    if (!(settingKey in config)) {
      return await sock.sendMessage(m.from, { text: `❌ *Invalid setting:* ${settingKey}` }, { quoted: m });
    }

    // ✅ Update config object in runtime
    config[settingKey] = settingValue;

    // ✅ Update .env file
    const envData = fs.readFileSync('.env', 'utf8').split('\n');
    const newEnvData = envData.map(line =>
      line.startsWith(settingKey) ? `${settingKey}=${settingValue}` : line
    );

    fs.writeFileSync('.env', newEnvData.join('\n'), 'utf8');

    await sock.sendMessage(m.from, {
      text: `✅ *Updated:* ${settingKey} → *${settingValue}*`,
    }, { quoted: m });
  }
};

export default configUpdate;
