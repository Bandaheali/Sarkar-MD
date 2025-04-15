import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';
import axios from 'axios';

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
  const hour = moment().tz('Asia/Karachi').hour();
  if (hour < 5) return '🌌 Good Night';
  if (hour < 12) return '🌄 Good Morning';
  if (hour < 17) return '🌅 Good Afternoon';
  if (hour < 20) return '🌃 Good Evening';
  return '🌌 Good Night';
};

// Menu Configuration
const MENU_SECTIONS = {
  1: {
  title: "🕌 Islamic Menu",
  commands: [
    { name: "𝐒𝐮𝐫𝐚𝐡𝐀𝐮𝐝𝐢𝐨", desc: "Surah Audio (default)" },
    { name: "𝐒𝐮𝐫𝐚𝐡𝐔𝐫𝐝𝐮", desc: "Surah in Urdu" },
    { name: "𝐒𝐮𝐫𝐚𝐡𝐀𝐫𝐛𝐢𝐜", desc: "Surah in Arabic" },
    { name: "𝐒𝐮𝐫𝐚𝐡𝐄𝐧𝐠", desc: "Surah in English" },
    { name: "𝐏𝐫𝐚𝐲𝐞𝐫𝐓𝐢𝐦𝐞", desc: "Prayer Timings" },
    { name: "𝐏𝐓𝐢𝐦𝐞", desc: "Short Prayer Time" },
    { name: "𝐒𝐁𝐮𝐤𝐡𝐚𝐫𝐢", desc: "Sahih Bukhari Hadith" }
  ]
  },
  2: {
    title: "📥 Download Menu",
    commands: [
      { name: "ytmp3", desc: "YouTube to MP3" },
      { name: "ytmp4", desc: "YouTube to MP4" },
      { name: "tiktok", desc: "Download TikTok" },
      { name: "play", desc: "Play music" },
      { name: "song", desc: "Download song" },
      { name: "video", desc: "Download video" }
    ]
  },
  3: {
    title: "🔄 Converter Menu",
    commands: [
      { name: "attp", desc: "Animated text" },
      { name: "emojimix", desc: "Mix emojis" },
      { name: "mp3", desc: "Convert audio" }
    ]
  },
  4: {
    title: "🤖 AI Menu",
    commands: [
      { name: "gpt", desc: "ChatGPT" },
      { name: "dalle", desc: "AI Image Generation" },
      { name: "gemini", desc: "Google Gemini" }
    ]
  }
};

const menu = async (m, Matrix) => {
  const prefix = config.PREFIX;
  
  // Check if message starts with prefix and is "menu2" command
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  if (cmd !== 'menu2') return;

  const mode = config.MODE === 'public' ? 'Public' : 'Private';
  const pushName = m.pushName || "User";
  const greeting = getGreeting();
  
  const realTime = moment().tz("Asia/Karachi").format("HH:mm:ss");
  const realDate = moment().tz("Asia/Karachi").format("DD/MM/YYYY");

  try {
    // Get the menu image once
    const menuImage = await axios.get(config.MENU_IMAGE || 
      'https://i.imgur.com/example.jpg', 
      { responseType: 'arraybuffer' });

    // Main Menu
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
      image: menuImage.data,
      caption: menuText,
      contextInfo: {
        externalAdReply: {
          title: config.BOT_NAME,
          body: pushName,
          thumbnail: menuImage.data,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    // Response Handler
    const handleReply = async (msg) => {
      // Check if it's a reply to our menu message
      const isReply = msg?.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;
      
      if (!isReply) return;

      const text = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || '';
      
      const choice = parseInt(text.trim());
      if (isNaN(choice) || !MENU_SECTIONS[choice]) return;

      const section = MENU_SECTIONS[choice];
      const sectionText = `╭───❍ *${section.title}* ❍───╮
│ 👤 User: ${pushName}
│ ${greeting}
│ 🌐 Prefix: ${prefix}
╰───────────────❍

*Available Commands:*
${section.commands.map(cmd => 
  `┃ ✦ ${prefix}${cmd.name} - ${cmd.desc}`).join('\n')}

*⚡ Powered by ${config.BOT_NAME} ⚡*`;

      // Send the same image with sub-menu
      await Matrix.sendMessage(m.from, {
        image: menuImage.data,
        caption: sectionText,
        mentions: [m.sender]
      }, { quoted: msg });
    };

    // Listen for new messages
    Matrix.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (msg.key.remoteJid === m.from && msg.key.fromMe || !msg.key.fromMe) {
        await handleReply(msg);
      }
    });

  } catch (error) {
    console.error('Menu Error:', error);
    await Matrix.sendMessage(m.from, {
      text: '⚠️ An error occurred while loading the menu. Please try again later.'
    }, { quoted: m });
  }
};

export default menu;
