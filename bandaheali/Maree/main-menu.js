import config from '../../config.cjs';
import moment from 'moment-timezone';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const mode = config.MODE;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const pushName = m.pushName || '𝐔𝐒𝐄𝐑';
  const img = config.ALIVE_IMG || 'https://files.catbox.moe/htnkaq.jpg';

  // Uptime calculation
  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  // Time and date
  const realTime = moment().tz("Asia/Karachi").format("HH:mm:ss");
  const realDate = moment().tz("Asia/Karachi").format("DD/MM/YYYY");

  // Greeting based on time
  let pushwish = "";
  if (realTime < "05:00:00") pushwish = `𝙶𝙾𝙾𝙳 𝙽𝙸𝙶𝙷𝚃 🌌`;
  else if (realTime < "12:00:00") pushwish = `𝙶𝙾𝙾𝙳 𝙼𝙾𝚁𝙽𝙸𝙽𝙶 🌄`;
  else if (realTime < "17:00:00") pushwish = `𝙶𝙾𝙾𝙳 𝙰𝙵𝚃𝙴𝚁𝙽𝙾𝙾𝙽 🌅`;
  else if (realTime < "20:00:00") pushwish = `𝙶𝙾𝙾𝙳 𝙴𝚅𝙴𝙽𝙸𝙽𝙶 🌃`;
  else pushwish = `𝙶𝙾𝙾𝙳 𝙽𝙸𝙶𝙷𝚃 🌌`;

  const sendMenuResponse = async (messageContent, quotedMsg = m) => {
    await sock.sendMessage(
      m.from,
      {
        text: messageContent,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "✨𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨",
            body: pushName,
            thumbnailUrl: img,
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
│ 👤 *𝐔𝐒𝐄𝐑:* *${pushName}* \n│ ${pushwish}  
│ 🌐 *𝐌𝐎𝐃𝐄:* *${mode}*  
│ ⏰ *𝐓𝐈𝐌𝐄:* *${realTime}🇵🇰*  
│ 📅 *𝐃𝐀𝐓𝐄:* *${realDate}*  
│ 🤖 *𝐔𝐏𝐓𝐈𝐌𝐄:* *${hours}/${minutes}/${seconds}*
╰───────────────❍  

*📌 𝐌𝐄𝐍𝐔 𝐎𝐏𝐓𝐈𝐎𝐍𝐒:*  
1️⃣ 🕌 *𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐌𝐞𝐧𝐮*
2️⃣ ⬇️ *𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐌𝐞𝐧𝐮*
3️⃣ 🤖 *𝐀𝐢 𝐌𝐞𝐧𝐮*
4️⃣ 👥 *𝐆𝐫𝐨𝐮𝐩 𝐌𝐞𝐧𝐮*
5️⃣ 🎨 *𝐋𝐨𝐠𝐨 𝐌𝐞𝐧𝐮*
6️⃣ 🛠️ *𝐎𝐰𝐧𝐞𝐫 𝐌𝐞𝐧𝐮*
7️⃣ ⚡ *𝐎𝐭𝐡𝐞𝐫 𝐌𝐞𝐧𝐮*
8️⃣ 🎁 *𝐄𝐱𝐭𝐫𝐚 𝐌𝐞𝐧𝐮* 
9️⃣ 🔍 *𝐒𝐞𝐚𝐫𝐜𝐡 𝐌𝐞𝐧𝐮*

➤ *Reply with a number (1-9) to select a menu.*  

*⚡ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐒𝐀𝐑𝐊𝐀𝐑-𝐌𝐃⚡*`;

    // Send the main menu
    const sentMsg = await sock.sendMessage(
      m.from,
      { 
        image: { url: img },
        caption: responseText,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "✨𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨",
            body: pushName,
            thumbnailUrl: img,
            sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD',
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        }
      },
      { quoted: m }
    );

    // Create a reply handler for this specific menu
    const replyHandler = async (responseMsg) => {
      if (!responseMsg?.message?.extendedTextMessage || 
          responseMsg.key.remoteJid !== m.from || 
          responseMsg.key.participant !== m.sender) {
        return;
      }

      const replyText = responseMsg.message.extendedTextMessage.text.trim();
      const isReplyToMenu = responseMsg.message.extendedTextMessage.contextInfo?.stanzaId === sentMsg.key.id;

      if (!isReplyToMenu) return;

      let menuResponse = '';
      switch (replyText) {
        case "1":
          menuResponse = `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
│ 🧑‍💻 *𝐔𝐒𝐄𝐑:* ${pushName} ${pushwish}
│ 🌐 *𝐌𝐎𝐃𝐄:* *${mode}*
│ ⏰ *𝐓𝐈𝐌𝐄:* *${realTime}🇵🇰*
│ 📅 *𝐃𝐀𝐓𝐄:* *${realDate}*
│ 🤖 *𝐔𝐏𝐓𝐈𝐌𝐄:* *${hours}/${minutes}/${seconds}*
╰───────────❍
 ╭───❍「 *𝐈𝐒𝐋𝐀𝐌𝐈𝐂 𝐌𝐄𝐍𝐔* 」
*│* 💙 *${prefix}𝐒𝐮𝐫𝐚𝐡𝐀𝐮𝐝𝐢𝐨*
*│* 💙 *${prefix}𝐒𝐮𝐫𝐚𝐡𝐔𝐫𝐝𝐮*
*│* 💙 *${prefix}𝐒𝐮𝐫𝐚𝐡𝐀𝐫𝐛𝐢𝐜*
*│* 💙 *${prefix}𝐒𝐮𝐫𝐚𝐡𝐄𝐧𝐠*
*│* 💙 *${prefix}𝐏𝐫𝐚𝐲𝐞𝐫𝐓𝐢𝐦𝐞*
*│* 💙 *${prefix}𝐏𝐓𝐢𝐦𝐞*
*│* 💙 *${prefix}𝐒𝐁𝐮𝐤𝐡𝐚𝐫𝐢*
 ╰───────────❍\n\n*_𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐒𝐀𝐑𝐊𝐀𝐑-𝐌𝐃_*`;
          break;
        // Add other cases here...
        default:
          menuResponse = "*❌ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐂𝐇𝐎𝐈𝐂𝐄. 𝐏𝐋𝐄𝐀𝐒𝐄 𝐑𝐄𝐏𝐋𝐘 𝐖𝐈𝐓𝐇 1 𝐓𝐎 9.*";
      }

      await sendMenuResponse(menuResponse, responseMsg);
    };

    // Add temporary listener
    sock.ev.on('messages.upsert', async ({ messages }) => {
      const responseMsg = messages[0];
      await replyHandler(responseMsg);
    });

    // Remove listener after some time (e.g., 2 minutes)
    setTimeout(() => {
      sock.ev.off('messages.upsert', replyHandler);
    }, 120000);
  }
};

export default menu;
