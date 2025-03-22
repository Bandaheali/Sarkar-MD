import fs from 'fs';
import dotenv from 'dotenv';
import config from '../../config.cjs';

dotenv.config(); // Load .env file

const configVar = async (m, sock) => {
  const ownerNumber = config.OWNER_NUMBER.replace(/[^0-9]/g, ""); // Owner number clean
  const senderNumber = m.sender.split('@')[0]; // Sender number clean

  const prefix = config.PREFIX;
  const args = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ') : [];

  if (!["addvar", "editvar"].includes(args[0].toLowerCase())) return; // ❌ If not a config command, ignore

  if (senderNumber !== ownerNumber) {
    return await sock.sendMessage(m.from, { text: "❌ *Only the Owner can update settings!*" }, { quoted: m });
  }

  if (args.length < 3) {
    return await sock.sendMessage(m.from, {
      text: "⚠️ *Usage:*\n`.addvar NEW_VARIABLE value`\n`.editvar EXISTING_VARIABLE new_value`"
    }, { quoted: m });
  }

  const settingKey = args[1].toUpperCase(); // Convert key to uppercase
  const settingValue = args.slice(2).join(' '); // Get value (string)

  let envData = fs.readFileSync('.env', 'utf8').split('\n');
  let updated = false;

  if (args[0].toLowerCase() === "addvar") {
    // ✅ `addvar`: Add only if it doesn't exist
    if (config[settingKey] !== undefined) {
      return await sock.sendMessage(m.from, { text: `⚠️ *${settingKey} already exists! Use .editvar instead.*` }, { quoted: m });
    }
    envData.push(`${settingKey}=${settingValue}`);
    updated = true;
  } else if (args[0].toLowerCase() === "editvar") {
    // ✅ `editvar`: Update only if it exists
    if (config[settingKey] === undefined) {
      return await sock.sendMessage(m.from, { text: `⚠️ *${settingKey} does not exist! Use .addvar instead.*` }, { quoted: m });
    }
    envData = envData.map(line => line.startsWith(settingKey) ? `${settingKey}=${settingValue}` : line);
    updated = true;
  }

  if (updated) {
    fs.writeFileSync('.env', envData.join('\n'), 'utf8');
    config[settingKey] = settingValue; // ✅ Update runtime config

    await sock.sendMessage(m.from, {
      text: `✅ *Updated:* ${settingKey} → *${settingValue}*`,
    }, { quoted: m });
  }
};

export default configVar;
