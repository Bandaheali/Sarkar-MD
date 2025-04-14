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

  const sendMenuMessage = async (content, options = {}) => {
    const baseMessage = {
      contextInfo: {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363315182578784@newsletter',
          newsletterName: "𝚂𝙰𝚁𝙺𝙰𝚁-𝙼𝙳",
          serverMessageId: -1,
        },
        externalAdReply: {
          title: "✨𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨",
          body: pushName,
          thumbnailUrl: img,
          sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD',
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
      ...options
    };

    await sock.sendMessage(m.from, baseMessage, { quoted: m });
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

    // Send main menu with image
    const sentMsg = await sendMenuMessage({
      image: { url: img },
      caption: responseText,
      mentions: [m.sender]
    });

    // Temporary listener for menu responses
    const menuResponseHandler = async (event) => {
      const receivedMsg = event.messages[0];
      if (!receivedMsg?.message?.extendedTextMessage || 
          receivedMsg.key.remoteJid !== m.from ||
          !receivedMsg.message.extendedTextMessage.contextInfo?.stanzaId) return;

      // Check if this is a reply to our menu message
      if (receivedMsg.message.extendedTextMessage.contextInfo.stanzaId !== sentMsg.key.id) return;

      const choice = receivedMsg.message.extendedTextMessage.text.trim();
      
      const menuTemplates = {
        "1": `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
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
 ╰───────────❍\n\n*_𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐒𝐀𝐑𝐊𝐀𝐑-𝐌𝐃_*`,
        
        "2": `╭───❍「 *✨ 𝚂𝚊𝚛𝚔𝚊𝚛-𝙼𝙳✨* 」
│ 🧑‍💻 *𝐔𝐒𝐄𝐑:* *${pushName}* *${pushwish}*
│ 🌐 *𝐌𝐎𝐃𝐄:* *${mode}*
│ ⏰ *𝐓𝐈𝐌𝐄:* *${realTime}🇵🇰*
│ 📅 *𝐃𝐀𝐓𝐄*: *${realDate}* 
│ 🤖 *𝐔𝐏𝐓𝐈𝐌𝐄:* *${hours}/${minutes}/${seconds}*
╰───────────❍
 ╭───❍「 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐌𝐄𝐍𝐔 」
 *│* 💙 *${prefix}𝐏𝐥𝐚𝐲*
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
 ╰───────────❍\n\n*_𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐒𝐀𝐑𝐊𝐀𝐑-𝐌𝐃_*`,
        
        // Add other menu templates here...
        
        "default": "*❌ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐂𝐇𝐎𝐈𝐂𝐄. 𝐏𝐋𝐄𝐀𝐒𝐄 𝐑𝐄𝐏𝐋𝐘 𝐖𝐈𝐓𝐇 1 𝐓𝐎 9.*"
      };

      const response = menuTemplates[choice] || menuTemplates.default;
      await sendMenuMessage({ text: response }, { quoted: receivedMsg });
    };

    // Add temporary listener
    const listener = (event) => menuResponseHandler(event);
    sock.ev.on('messages.upsert', listener);

    // Remove listener after 2 minutes
