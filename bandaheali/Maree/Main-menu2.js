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
  2: {
    title: "🔄 Converter Menu",
    commands: [
      { name: "attp", desc: "Animated text" },
      { name: "emojimix", desc: "Mix emojis" },
      { name: "mp3", desc: "Convert audio" }
    ]
  },
  3: {
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
  if (!m.body.startsWith(prefix) || m.body.slice(prefix.length).split(' ')[0].toLowerCase() !== 'menu2') {
    return; // Ignore if not the menu command
  }

  const mode = config.MODE === 'public' ? 'Public' : 'Private';
  const pushName = m.pushName || "User";
  const greeting = getGreeting();
  
  const realTime = moment().tz("Asia/Karachi").format("HH:mm:ss");
  const realDate = moment().tz("Asia/Karachi").format("DD/MM/YYYY");

  try {
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
      text: menuText,
      contextInfo: {
        externalAdReply: {
          title: config.BOT_NAME,
          body: pushName,
          thumbnail: await (await axios.get(config.MENU_IMAGE || 
            'https://i.imgur.com/example.jpg', 
            { responseType: 'arraybuffer' })).data,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    // Response Handler
    const responseHandler = async (event) => {
      const msg = event.messages?.[0];
      if (!msg || msg.key.remoteJid !== m.from || msg.key.fromMe) return;

      // Check if this is a reply to our menu message
      const isReply = msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;
      const isMention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(Matrix.user.id);
      
      if (!isReply && !isMention) return;

      const text = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || '';
      
      const choice = parseInt(text.trim());
      if (isNaN(choice) return;

      const section = MENU_SECTIONS[choice];
      if (!section) return;

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
        mentions: [m.sender]
      }, { quoted: msg });

      // Clean up
      Matrix.ev.off('messages.upsert', responseHandler);
    };

    // Set timeout for cleanup
    setTimeout(() => {
      Matrix.ev.off('messages.upsert', responseHandler);
    }, 60000); // 1 minute timeout

    Matrix.ev.on('messages.upsert', responseHandler);

  } catch (error) {
    console.error('Menu Error:', error);
    await Matrix.sendMessage(m.from, {
      text: '⚠️ An error occurred while loading the menu. Please try again later.'
    }, { quoted: m });
  }
};

export default menu;
