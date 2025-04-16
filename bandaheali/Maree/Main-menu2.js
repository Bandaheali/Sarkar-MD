import moment from 'moment-timezone';
import os from 'os';
import axios from 'axios';
import config from '../../config.cjs';

// Utility Functions
const formatBytes = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const getUptime = () => {
  const seconds = process.uptime();
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
};

const getGreeting = () => {
  const hour = moment().tz(config.TIMEZONE || 'Asia/Karachi').hour();
  if (hour < 5) return '🌌 Good Night';
  if (hour < 12) return '🌄 Good Morning';
  if (hour < 17) return '🌅 Good Afternoon';
  if (hour < 20) return '🌃 Good Evening';
  return '🌌 Good Night';
};

// Menu Configuration
const MENU_SECTIONS = {
  1: {
    title: "📥 Download Menu",
    commands: [
      { name: "ytmp3", desc: "YouTube to MP3" },
      { name: "ytmp4", desc: "YouTube to MP4" },
      { name: "tiktok", desc: "Download TikTok" },
      { name: "play", desc: "Play music" },
      { name: "song", desc: "Download song" },
      { name: "video", desc: "Download video" }
    ],
    image: config.DOWNLOAD_MENU_IMAGE || 'https://i.imgur.com/download.jpg'
  },
  2: {
    title: "🔄 Converter Menu",
    commands: [
      { name: "attp", desc: "Animated text" },
      { name: "emojimix", desc: "Mix emojis" },
      { name: "mp3", desc: "Convert audio" }
    ],
    image: config.CONVERTER_MENU_IMAGE || 'https://i.imgur.com/converter.jpg'
  },
  3: {
    title: "🤖 AI Menu",
    commands: [
      { name: "gpt", desc: "ChatGPT" },
      { name: "dalle", desc: "AI Image Generation" },
      { name: "gemini", desc: "Google Gemini" }
    ],
    image: config.AI_MENU_IMAGE || 'https://i.imgur.com/ai.jpg'
  }
};

const fetchImage = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error("Image fetch failed:", error);
    return null;
  }
};

// Main Menu Function
const menu = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  if (cmd !== 'menu2') return;

  const mode = config.MODE === 'public' ? 'Public' : 'Private';
  const pushName = m.pushName || "User";
  const greeting = getGreeting();
  const timezone = config.TIMEZONE || 'Asia/Karachi';
  const realTime = moment().tz(timezone).format("HH:mm:ss");
  const realDate = moment().tz(timezone).format("DD/MM/YYYY");

  try {
    // --- Send Main Menu ---
    const mainMenuImage = await fetchImage(config.MENU_IMAGE || 'https://i.imgur.com/main.jpg');
    const menuText = `╭───❍ *${config.BOT_NAME}* ❍───╮
│ 👤 User: ${pushName}
│ ${greeting}
│ 🌐 Mode: ${mode}
│ ⏰ Time: ${realTime}
│ 📅 Date: ${realDate}
│ ⚡ Uptime: ${getUptime()}
│ 💾 RAM: ${formatBytes(os.freemem())}/${formatBytes(os.totalmem())}
╰───────────────❍

*📌 MAIN MENU OPTIONS:*
${Object.entries(MENU_SECTIONS).map(([num, section]) => 
  `┃ ${num}. ${section.title}`).join('\n')}

Reply with a number (1-${Object.keys(MENU_SECTIONS).length}) to select a menu section.

*⚡ Powered by ${config.BOT_NAME} ⚡*`;

    const sentMsg = await Matrix.sendMessage(m.from, {
      text: menuText,
      ...(mainMenuImage && {
        contextInfo: {
          externalAdReply: {
            title: config.BOT_NAME,
            body: pushName,
            thumbnail: mainMenuImage,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      })
    }, { quoted: m });

    // --- Reply Handler (Persistent) ---
    const handler = async ({ messages }) => {
      const msg = messages[0];
      if (msg.key.remoteJid !== m.from || msg.key.fromMe) return;

      // Check if it's a reply to the main menu or sub-menu
      const isReply = msg?.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;
      if (!isReply) return;

      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const choice = parseInt(text.trim());

      // Invalid Input Handling
      if (isNaN(choice) || !MENU_SECTIONS[choice]) {
        await Matrix.sendMessage(m.from, {
          text: `❌ Invalid choice! Reply with a number (1-${Object.keys(MENU_SECTIONS).length}).`,
          mentions: [m.sender]
        }, { quoted: msg });
        return;
      }

      // --- Send Sub-Menu ---
      const section = MENU_SECTIONS[choice];
      const sectionImage = await fetchImage(section.image);
      const sectionText = `╭───❍ *${section.title}* ❍───╮
│ 👤 User: ${pushName}
│ ${greeting}
│ 🌐 Prefix: ${prefix}
╰───────────────❍

*Available Commands:*
${section.commands.map(cmd => 
  `┃ ✦ ${prefix}${cmd.name} - ${cmd.desc}`).join('\n')}

*⚡ Powered by ${config.BOT_NAME} ⚡*`;

      await Matrix.sendMessage(m.from, {
        text: sectionText,
        mentions: [m.sender],
        ...(sectionImage && {
          contextInfo: {
            externalAdReply: {
              title: section.title,
              body: `Prefix: ${prefix}`,
              thumbnail: sectionImage,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        })
      }, { quoted: msg });
    };

    // Attach persistent listener
    Matrix.ev.on('messages.upsert', handler);

  } catch (error) {
    console.error('Menu Error:', error);
    await Matrix.sendMessage(m.from, {
      text: '⚠️ An error occurred. Please try again later.'
    }, { quoted: m });
  }
};

export default menu;
