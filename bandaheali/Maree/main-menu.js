import moment from 'moment-timezone';
import os from 'os';
import config from '../config.cjs';

// Time greeting function
const getGreeting = () => {
  const time = moment().tz("Asia/Colombo").format("HH:mm:ss");
  if (time < "05:00:00") return `Good Morning 🌄`;
  if (time < "11:00:00") return `Good Morning 🌄`;
  if (time < "15:00:00") return `Good Afternoon 🌅`;
  if (time < "18:00:00") return `Good Evening 🌃`;
  if (time < "19:00:00") return `Good Evening 🌃`;
  return `Good Night 🌌`;
};

const menu = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const mode = config.MODE === 'public' ? 'public' : 'private';
  const botName = config.BOT_NAME || '*_SARKAR-MD_*';
  const caption = config.CAPTION || '*_Powered By Sarkar-MD_*';
  const menuImage = config.ALIVE_IMG || 'https://files.catbox.moe/htnkaq.jpg';

  const validCommands = ['list', 'help', 'menu'];

  if (!validCommands.includes(cmd)) return;

  try {
    // Calculate uptime
    const uptime = process.uptime();
    const day = Math.floor(uptime / (24 * 3600));
    const hours = Math.floor((uptime % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const pushwish = getGreeting();

    const mainMenu = `
╭━━━〔 *${botName}* 〕━━━┈⊷
┃★╭──────────────
┃★│ Owner : *${config.OWNER_NAME}*
┃★│ User : *${m.pushName}*
┃★│ Baileys : *Multi Device*
┃★│ Type : *NodeJs*
┃★│ Mode : *${mode}*
┃★│ Platform : *${os.platform()}*
┃★│ Prefix : [${prefix}]
┃★│ Version : *3.1.0*
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

> ${pushwish} *${m.pushName}*!

╭━━〔 *Menu List* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• 1. Download Menu      
┃◈┃• 2. Converter Menu        
┃◈┃• 3. AI Menu  
┃◈┃• 4. Tools Menu  
┃◈┃• 5. Group Menu 
┃◈┃• 6. Search Menu   
┃◈┃• 7. Main Menu
┃◈┃• 8. Owner Menu 
┃◈┃• 9. Stalk Menu     
┃◈┃• update
┃◈└───────────┈⊷
╰──────────────┈⊷
> *Reply with the number (1-9)*`;

    // Send main menu
    const sentMsg = await Matrix.sendMessage(m.from, {
      image: { url: menuImage },
      caption: mainMenu,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: config.NEWSLETTER_JID || '120363315182578784@newsletter',
          newsletterName: config.NEWSLETTER_NAME || "SARKAR-MD",
          serverMessageId: 143
        }
      }
    }, { quoted: m });

    // Send audio if configured
    if (config.MENU_AUDIO_URL) {
      await Matrix.sendMessage(m.from, {
        audio: { url: config.MENU_AUDIO_URL },
        mimetype: 'audio/mp4',
        ptt: true
      }, { quoted: m });
    }

    // Menu response handler
    const handleMenuResponse = async (event) => {
      const receivedMsg = event.messages[0];
      if (!receivedMsg?.message?.extendedTextMessage || 
          receivedMsg.key.remoteJid !== m.from ||
          receivedMsg.message.extendedTextMessage.contextInfo?.stanzaId !== sentMsg.key.id) {
        return;
      }

      const choice = receivedMsg.message.extendedTextMessage.text.trim();
      const menuData = {
        "1": {
          title: "Download Menu",
          content: `
┃◈╭─────────────·๏
┃◈┃• apk
┃◈┃• facebook
┃◈┃• mediafire
┃◈┃• pinterestdl
┃◈┃• gitclone
┃◈┃• gdrive
┃◈┃• insta
┃◈┃• ytmp3
┃◈┃• ytmp4
┃◈┃• play
┃◈┃• song
┃◈┃• video
┃◈┃• ytmp3doc
┃◈┃• ytmp4doc
┃◈┃• tiktok
┃◈└───────────┈⊷`
        },
        // Add other menu options here...
        "default": {
          title: "Invalid Choice",
          content: "*Invalid Reply Please Reply With A Number Between 1 to 9*"
        }
      };

      const selectedMenu = menuData[choice] || menuData.default;
      const response = `
╭━━━〔 *${botName} - ${selectedMenu.title}* 〕━━━┈⊷
┃★╭──────────────
┃★│• Owner : *${config.OWNER_NAME}*
┃★│• User : *${m.pushName}*
┃★│• Prefix : [${prefix}]
┃★│• Version : *1.0.0*
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

╭━━〔 *${selectedMenu.title}* 〕━━┈⊷
${selectedMenu.content}
╰──────────────┈⊷

> *${caption}*`;

      await Matrix.sendMessage(m.from, {
        image: { url: menuImage },
        caption: response,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.NEWSLETTER_JID || '120363315182578784@newsletter',
            newsletterName: config.NEWSLETTER_NAME || "SARKAR-MD",
            serverMessageId: 143
          }
        }
      }, { quoted: receivedMsg });
    };

    // Add temporary listener
    const listener = (event) => handleMenuResponse(event);
    Matrix.ev.on('messages.upsert', listener);

    // Remove listener after 2 minutes
    setTimeout(() => {
      Matrix.ev.off('messages.upsert', listener);
    }, 120000);

  } catch (error) {
    console.error('Menu Error:', error);
    await Matrix.sendMessage(m.from, { 
      text: '❌ An error occurred while processing your request' 
    }, { quoted: m });
  }
};

export default menu;
