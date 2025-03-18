import config from '../../config.cjs';
import moment from 'moment-timezone';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const mode = config.MODE;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const pushName = m.pushName || 'User';

  // Get current time and date
  const realTime = moment().tz("Asia/Karachi").format("HH:mm:ss");
  const realDate = moment().tz("Asia/Karachi").format("DD MM YYYY");

  let pushwish = "";
  if (realTime < "05:00:00") {
    pushwish = `𝙶𝙾𝙾𝙳 𝙽𝙸𝙶𝙷𝚃 🌌`;
  } else if (realTime < "12:00:00") {
    pushwish = `𝙶𝙾𝙾𝙳 𝙼𝙾𝚁𝙽𝙸𝙽𝙶 🌄`;
  } else if (realTime < "17:00:00") {
    pushwish = `𝙶𝙾𝙾𝙳 𝙰𝙵𝚃𝙴𝚁𝙽𝙾𝙾𝙽 🌅`;
  } else if (realTime < "20:00:00") {
    pushwish = `𝙶𝙾𝙾𝙳 𝙴𝚅𝙴𝙽𝙸𝙽𝙶 🌃`;
  } else {
    pushwish = `𝙶𝙾𝙾𝙳 𝙽𝙸𝙶𝙷𝚃 🌌`;
  }

  const sendCommandMessage = async (messageContent, quotedMsg = m) => {
    await sock.sendMessage(
      m.from,
      {
        text: messageContent,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315182578784@newsletter',
            newsletterName: "𝚂𝙰𝚁𝙺𝙰𝚁-𝙼𝙳",
            serverMessageId: -1,
          },
          externalAdReply: {
            title: "✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨",
            body: pushName,
            thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
            sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD',
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: quotedMsg }
    );
  };

  if (cmd === "menu") {
    const responseText = `╭───❍ *✨ 𝚂𝙰𝚁𝙺𝙰𝚁-𝙼𝙳 ✨* ❍───╮  
│ 👤 𝚄𝚜𝚎𝚛: *${pushName}* \n│ ${pushwish}  
│ 🌐 𝙼𝚘𝚍𝚎: *${mode}*  
│ ⏰ 𝚃𝚒𝚖𝚎: *${realTime}*  
│ 📅 𝙳𝚊𝚝𝚎: *${realDate}*  
╰───────────────❍  

*📌 𝙼𝙴𝙽𝚄 𝙾𝙿𝚃𝙸𝙾𝙽𝚂:*  
1️⃣ 🕌 *Islamic Menu*  
2️⃣ ⬇️ *Download Menu*  
3️⃣ 🤖 *AI Menu*  
4️⃣ 👥 *Group Menu*  
5️⃣ 🎨 *Custom Menu 1*  
6️⃣ 🛠️ *Custom Menu 2*  
7️⃣ ⚡ *Custom Menu 3*  
8️⃣ 🎁 *Extra Features*  

➤ *Reply with a number (1-8) to select a menu.*  

*⚡ POWERED BY BANDAHEALI ⚡*`;

    const sentMessage = await sock.sendMessage(m.from, { text: responseText }, { quoted: m });

    sock.ev.on('messages.upsert', async (event) => {
      const receivedMessage = event.messages[0];
      if (!receivedMessage?.message?.extendedTextMessage) return;

      const receivedText = receivedMessage.message.extendedTextMessage.text.trim();
      if (receivedMessage.message.extendedTextMessage.contextInfo?.stanzaId !== sentMessage.key.id) return;

      let menuResponse = `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
│ 🧑‍💻 *𝚄𝚜𝚎𝚛:* ${pushName} ${pushwish}
│ 🌐 *𝙼𝚘𝚍𝚎:* ${mode}
│ ⏰ *𝚃𝚒𝚖𝚎:* ${realTime}
│ 📅 𝙳𝚊𝚝𝚎: *${realDate}*  
╰───────────❍
`;
      switch (receivedText) {
        case "1":
          menuResponse = `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
│ 🧑‍💻 *𝚄𝚜𝚎𝚛:* ${pushName} ${pushwish}
│ 🌐 *𝙼𝚘𝚍𝚎:* ${mode}
│ ⏰ *𝚃𝚒𝚖𝚎:* ${realTime}
│ 📅 𝙳𝚊𝚝𝚎: *${realDate}*  
╰───────────❍
╭───❍「 *𝙸𝚂𝙻𝙰𝙼𝙸𝙲 𝙼𝙴𝙽𝚄 𝙾𝚏 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
*│* 💙 *${prefix}𝚂𝚞𝚛𝚊𝚑𝚊𝚞𝚍𝚒𝚘*
*│* 💙 *${prefix}𝚂𝚞𝚛𝚊𝚑𝚞𝚛𝚍𝚞*
*│* 💙 *${prefix}𝙰𝚜𝚖𝚊𝚞𝚕𝚑𝚞𝚜𝚗𝚊*
*│* 💙 *${prefix}𝙿𝚛𝚘𝚙𝚑𝚎𝚝𝚗𝚊𝚖𝚎*
╰───────────❍\n\n*_POWERED BY SARKAR-MD_*`;
          break;
        case "2":
          menuResponse = `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
│ 🧑‍💻 *𝚄𝚜𝚎𝚛:* ${pushName} ${pushwish}
│ 🌐 *𝙼𝚘𝚍𝚎:* ${mode}
│ ⏰ *𝚃𝚒𝚖𝚎:* ${realTime}
│ 📅 𝙳𝚊𝚝𝚎: *${realDate}*  
╰───────────❍
╭───❍「 *DOWNLOAD 𝙼𝙴𝙽𝚄 𝙾𝚏 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
*│* 💙 *${prefix}SONG*
*│* 💙 *${prefix}SONG2*
*│* 💙 *${prefix}SONG3*
*│* 💙 *${prefix}VIDEO*
*│* 💙 *${prefix}VIDEO2*
*│* 💙 *${prefix}VIDEO3*
*│* 💙 *${prefix}FB*
*│* 💙 *${prefix}FB2*
*│* 💙 *${prefix}INSTA*
*│* 💙 *${prefix}INSTA2*
╰───────────❍\n\n*_POWERED BY SARKAR-MD_*`;
          break;
        case "3":
          menuResponse = `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
│ 🧑‍💻 *𝚄𝚜𝚎𝚛:* ${pushName} ${pushwish}
│ 🌐 *𝙼𝚘𝚍𝚎:* ${mode}
│ ⏰ *𝚃𝚒𝚖𝚎:* ${realTime}
│ 📅 𝙳𝚊𝚝𝚎: *${realDate}*  
╰───────────❍`;
          break;
        case "4":
          menuResponse = `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
│ 🧑‍💻 *𝚄𝚜𝚎𝚛:* ${pushName} ${pushwish}
│ 🌐 *𝙼𝚘𝚍𝚎:* ${mode}
│ ⏰ *𝚃𝚒𝚖𝚎:* ${realTime}
│ 📅 𝙳𝚊𝚝𝚎: *${realDate}*  
╰───────────❍`;
          break;
        case "5":
          menuResponse = `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
│ 🧑‍💻 *𝚄𝚜𝚎𝚛:* ${pushName} ${pushwish}
│ 🌐 *𝙼𝚘𝚍𝚎:* ${mode}
│ ⏰ *𝚃𝚒𝚖𝚎:* ${realTime}
│ 📅 𝙳𝚊𝚝𝚎: *${realDate}*  
╰───────────❍`;
          break;
        case "6":
          menuResponse = `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
│ 🧑‍💻 *𝚄𝚜𝚎𝚛:* ${pushName} ${pushwish}
│ 🌐 *𝙼𝚘𝚍𝚎:* ${mode}
│ ⏰ *𝚃𝚒𝚖𝚎:* ${realTime}
│ 📅 𝙳𝚊𝚝𝚎: *${realDate}*  
╰───────────❍`;
          break;
        case "7":
          menuResponse = `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
│ 🧑‍💻 *𝚄𝚜𝚎𝚛:* ${pushName} ${pushwish}
│ 🌐 *𝙼𝚘𝚍𝚎:* ${mode}
│ ⏰ *𝚃𝚒𝚖𝚎:* ${realTime}
│ 📅 𝙳𝚊𝚝𝚎: *${realDate}*  
╰───────────❍`;
          break;
        case "8":
          menuResponse = `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
│ 🧑‍💻 *𝚄𝚜𝚎𝚛:* ${pushName} ${pushwish}
│ 🌐 *𝙼𝚘𝚍𝚎:* ${mode}
│ ⏰ *𝚃𝚒𝚖𝚎:* ${realTime}
│ 📅 𝙳𝚊𝚝𝚎: *${realDate}*  
╰───────────❍`;
          break;
        default:
          menuResponse = "*❌ Invalid choice. Please reply with 1 to 8.*";
      }

      await sendCommandMessage(menuResponse, receivedMessage);
    });
  }
};

export default menu;
