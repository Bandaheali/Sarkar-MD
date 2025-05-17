import moment from 'moment-timezone';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import fs from 'fs';
import os from 'os';
import config from '../../config.js';

const allMenus = async (m, sock) => {
  const prefix = config.PREFIX;
  const mode = config.MODE;
  const name = config.BOT_NAME;
  const owner = config.OWNER_NAME
  const pushName = m.pushName || 'User';
  
  const formatBytes = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
    
        // Calculate uptime
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (24 * 3600));
    const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    //realtime function
        const realTime = moment().tz("Asia/Karachi").format("HH:mm:ss");
// pushwish function
    let pushwish = "";
    
        if (realTime < "05:00:00") {
  pushwish = `𝙶𝙾𝙾𝙳 𝙼𝙾𝚁𝙽𝙸𝙽𝙶 🌄`;
} else if (realTime < "11:00:00") {
  pushwish = `𝙶𝙾𝙾𝙳 𝙼𝙾𝚁𝙽𝙸𝙽𝙶 🌄`;
} else if (realTime < "15:00:00") {
  pushwish = `𝙶𝙾𝙾𝙳 𝙰𝙵𝚃𝙴𝚁𝙽𝙾𝙾𝙽 🌅`;
} else if (realTime < "18:00:00") {
  pushwish = `𝙶𝙾𝙾𝙳 𝙴𝚅𝙴𝙽𝙸𝙽𝙶 🌃`;
} else if (realTime < "19:00:00") {
  pushwish = `𝙶𝙾𝙾𝙳 𝙴𝚅𝙴𝙽𝙸𝙽𝙶 🌃`;
} else {
  pushwish = `𝙶𝙾𝙾𝙳 𝙽𝙸𝙶𝙷𝚃 🌌`;
}

  const sendCommandMessage = async (messageCaption) => {
  await sock.sendMessage(
    m.from,
    {
      image: {
        url: config.MENU_IMAGE || 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
      },
      caption: messageCaption,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363315182578784@newsletter',
          newsletterName: "SARKAR-MD",
          serverMessageId: -1,
        },
      },
    },
    { quoted: m }
  );
};

  // Command: allmenu
  if (cmd === "allmenu") {
    await m.React('⏳'); // React with a loading icon
    const aliveMessage = `
╭───❍「 *✨${name}✨* 」
│ 🧑‍💻 *𝚄𝚜𝚎𝚛:* ${pushName} ${pushwish}
│ 🌐 *𝙼𝚘𝚍𝚎:* ${mode}
│ ⏰ *𝚃𝚒𝚖𝚎:* ${realTime}
│ 😇 *Owner:* ${owner}
│ 🪄 *Prefix:* ${prefix}
│ 🇵🇰 *Creater:* *_BANDAHEALI_*
│ 📋 *RAM:* ${formatBytes(os.freemem())} / ${formatBytes(os.totalmem())}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍
╭───❍「 *𝐈𝐒𝐋𝐀𝐌𝐈𝐂 𝐌𝐄𝐍𝐔* 」
*│* 💙 *${prefix}𝐒𝐮𝐫𝐚𝐡𝐀𝐮𝐝𝐢𝐨*
*│* 💙 *${prefix}𝐒𝐮𝐫𝐚𝐡𝐔𝐫𝐝𝐮*
*│* 💙 *${prefix}𝐒𝐮𝐫𝐚𝐡𝐀𝐫𝐛𝐢𝐜*
*│* 💙 *${prefix}𝐒𝐮𝐫𝐚𝐡𝐄𝐧𝐠*
*│* 💙 *${prefix}𝐏𝐫𝐚𝐲𝐞𝐫𝐓𝐢𝐦𝐞*
*│* 💙 *${prefix}𝐏𝐓𝐢𝐦𝐞*
*│* 💙 *${prefix}𝐒𝐁𝐮𝐤𝐡𝐚𝐫𝐢*  
╰───────────❍
╭───❍「 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐌𝐄𝐍𝐔 」
*│* 💙 *${prefix}Play*
*│* 💙 *${prefix}𝐒𝐨𝐧𝐠*
*│* 💙 *${prefix}𝐒𝐨𝐧𝐠2*
*│* 💙 *${prefix}𝐒𝐨𝐧𝐠3*
*│* 💙 *${prefix}𝐕𝐢𝐝𝐞𝐨*
*│* 💙 *${prefix}𝐕𝐢𝐝𝐞𝐨2*
*│* 💙 *${prefix}𝐕𝐢𝐝𝐞𝐨3*
*│* 💙 *${prefix}𝐅𝐁*
*│* 💙 *${prefix}𝐅𝐁2*
*│* 💙 *${prefix}𝐈𝐧𝐬𝐭𝐚*
*│* 💙 *${prefix}𝐈𝐧𝐬𝐭𝐚*
*│* 💙 *${prefix}𝐓𝐢𝐤𝐓𝐨𝐤*
*│* 💙 *${prefix}𝐓𝐢𝐤𝐓𝐨𝐤2*
*│* 💙 *${prefix}𝐓𝐢𝐤𝐬*
*│* 💙 *${prefix}𝐒𝐧𝐚𝐜𝐤*
*│* 💙 *${prefix}𝐓𝐰𝐞𝐞𝐓*
*│* 💙 *${prefix}𝐀𝐩𝐤*
╰───────────❍
╭───❍「 *𝐀𝐈 𝐌𝐄𝐍𝐔* 」
*│* 💙 *${prefix}𝐀𝐈*
*│* 💙 *${prefix}𝐆𝐏𝐓*
*│* 💙 *${prefix}𝐁𝐥𝐚𝐜𝐤𝐁𝐨𝐱*
*│* 💙 *${prefix}𝐈𝐦𝐚𝐠𝐢𝐧𝐞*
*│* 💙 *${prefix}𝐈𝐦𝐚𝐠𝐢𝐧𝐞2*
*│* 💙 *${prefix}𝐈𝐦𝐚𝐠𝐢𝐧𝐞3*
╰───────────❍
╭───❍「 *𝐆𝐑𝐎𝐔𝐏 𝐌𝐄𝐍𝐔* 」
*│* 💙 *${prefix}𝐀𝐧𝐭𝐢𝐋𝐢𝐧𝐤*
*│* 💙 *${prefix}𝐀𝐧𝐭𝐢𝐌𝐞𝐝𝐢𝐚*
*│* 💙 *${prefix}𝐀𝐧𝐭𝐢𝐕𝐨𝐢𝐜𝐞*
*│* 💙 *${prefix}𝐓𝐚𝐠𝐀𝐥𝐥*
*│* 💙 *${prefix}𝐇𝐢𝐝𝐞𝐓𝐚𝐠*
*│* 💙 *${prefix}𝐎𝐩𝐞𝐧*
*│* 💙 *${prefix}𝐂𝐥𝐨𝐬𝐞*
*│* 💙 *${prefix}𝐀𝐝𝐝*
*│* 💙 *${prefix}𝐈𝐧𝐯𝐢𝐭𝐞*
*│* 💙 *${prefix}𝐊𝐢𝐜𝐤*
*│* 💙 *${prefix}𝐃𝐢𝐬*
*│* 💙 *${prefix}𝐑𝐞𝐬𝐞𝐭𝐋𝐢𝐧𝐤*
*│* 💙 *${prefix}𝐆𝐜𝐋𝐢𝐧𝐤* 
*│* 💙 *${prefix}𝐎𝐮𝐓*
 ╰───────────❍
 ╭───❍「 **𝐋𝐎𝐆𝐎 𝐌𝐄𝐍𝐔* 」
*┋* © *${prefix}𝙻𝚘𝙶𝚘*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘1*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘2*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘3*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘4*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘5*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘6*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘6*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘7*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘8*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘9*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘10*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘11*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘12*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘13*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘14*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘15*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘16*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘17*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘18*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘19*
*┋* ©️ *${prefix}𝙻𝚘𝙶𝚘20*
╰───────────❍
╭───❍「 *𝐎𝐖𝐍𝐄𝐑 𝐌𝐄𝐍𝐔* 」
*│* 💙 *${prefix}𝐀𝐥𝐥𝐯𝐚𝐫*
*│* 💙 *${prefix}𝐀𝐝𝐝𝐕𝐚𝐫*
*│* 💙 *${prefix}𝐄𝐝𝐢𝐭𝐕𝐚𝐫*
*│* 💙 *${prefix}𝐑𝐞𝐬𝐭𝐚𝐫𝐭*
*│* 💙 *${prefix}𝗝𝗼𝗶𝗻*
*│* 💙 *${prefix}𝗟𝗲𝗳𝘁*
*│* 💙 *${prefix}𝗕𝗹𝗼𝗰𝗸*
*│* 💙 *${prefix}𝗨𝗻𝗯𝗹𝗼𝗰𝗸*
*│* 💙 *${prefix}𝗔𝗹𝘄𝗮𝘆𝘀𝗢𝗻𝗹𝗶𝗻𝗲*
*│* 💙 *${prefix}𝗧𝘆𝗽𝗶𝗻𝗴*
*│* 💙 *${prefix}𝗥𝗲𝗰𝗼𝗱𝗶𝗻𝗴*
*│* 💙 *${prefix}𝗔𝗻𝘁𝗶𝗖𝗮𝗹𝗹*
*│* 💙 *${prefix}𝗔𝘂𝘁𝗼𝗥𝗲𝗮𝗱*
*│* 💙 *${prefix}𝗔𝘂𝘁𝗼𝗿𝗲𝗮𝗰𝘁*
*│* 💙 *${prefix}𝗖𝗵𝗮𝘁𝗕𝗼𝘁*
*│* 💙 *${prefix}𝗣𝗺𝗕𝗹𝗼𝗰𝗸*
*│* 💙 *${prefix}𝗔𝗻𝘁𝗶𝗱𝗲𝗹𝗲𝘁𝗲*
*│* 💙 *${prefix}𝗔𝗻𝘁𝗶𝗱𝗲𝗹𝗲𝘁𝗲 𝘀𝘁𝗮𝘁𝘀*
╰───────────❍
╭───❍「 *𝐎𝐓𝐇𝐄𝐑 𝐌𝐄𝐍𝐔* 」
*│ *🗿 *${prefix}𝙿𝚒𝚗𝚐*
*│ *🗿 *${prefix}𝙰𝚋𝚘𝚞𝚝*
*│ *🗿 *${prefix}𝚛𝚎𝚙𝚘*
*│ *🗿 *${prefix}𝙰𝚕𝚒𝚟𝚎*
*│ *🗿 *${prefix}𝚄𝚛𝚕*
*│ *🗿 *𝚂𝚎𝚗𝚍𝚖𝚎*
╰───────────❍ 
 ╭───❍「 *𝐓𝐎𝐎𝐋𝐒 𝐌𝐄𝐍𝐔* 」
*│* 💙 *${prefix}𝐅𝐞𝐭𝐜𝐡*
*│* 💙 *${prefix}𝐒𝐡𝐨𝐫𝐭𝐞𝐧*
*│* 💙 *${prefix}𝐓𝐭𝐬*
*│* 💙 *${prefix}𝐓𝐬𝐭𝐚𝐥𝐤*
*│* 💙 *${prefix}𝐍𝐩𝐦*
*│* 💙 *${prefix}𝐆𝐢𝐭𝐒𝐭𝐚𝐥𝐤*
 ╰───────────❍
 ╭───❍「 *𝐒𝐄𝐀𝐑𝐂𝐇 𝐌𝐄𝐍𝐔* 」
*│* 💙 *${prefix}𝐘𝐓𝐒*
*│* 💙 *${prefix}𝐒𝐬𝐩𝐨𝐭𝐢𝐟𝐲*
*│* 💙 *${prefix}𝐋𝐲𝐫𝐢𝐜𝐬*
*│* 💙 *${prefix}𝐏𝐥𝐚𝐲𝐬𝐭𝐨𝐫𝐞*
 ╰───────────❍
`;

    await m.React('✅'); // React with success icon
    await sendCommandMessage(aliveMessage);
  }
  };
  export default allMenus;
