import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import axios from 'axios';
import config from '../../config.cjs';

// --- Global Session Tracker (Prevents Memory Leaks) ---
const activeMenuSessions = new Map();

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
    // --- Fetch Menu Thumbnail (Fallback to Text if Fails) ---
    let thumbnail;
    try {
      const imageRes = await axios.get(config.MENU_IMAGE || 'https://i.imgur.com/example.jpg', {
        responseType: 'arraybuffer'
      });
      thumbnail = Buffer.from(imageRes.data);
    } catch (err) {
      console.error("Menu image failed:", err);
      thumbnail = null;
    }

    // --- Main Menu Text ---
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

    // --- Send Menu ---
    const messageOptions = {
      text: menuText,
      mentions: [m.sender]
    };

    if (thumbnail) {
      messageOptions.contextInfo = {
        externalAdReply: {
          title: config.BOT_NAME,
          body: pushName,
          thumbnail: thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      };
    }

    const sentMsg = await Matrix.sendMessage(m.from, messageOptions, { quoted: m });

    // --- Clean Previous Session (If Any) ---
    const existingHandler = activeMenuSessions.get(m.sender);
    if (existingHandler) {
      Matrix.ev.off('messages.upsert', existingHandler.handler);
      clearTimeout(existingHandler.timeout);
    }

    // --- Reply Handler ---
    const handler = async ({ messages }) => {
      const msg = messages[0];
      if (msg.key.remoteJid !== m.from || msg.key.fromMe) return;

      // Check if it's a reply to the menu
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

      // --- Send Selected Menu Section ---
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

      await Matrix.sendMessage(m.from, {
        text: sectionText,
        mentions: [m.sender]
      }, { quoted: msg });

      // --- Cleanup ---
      Matrix.ev.off('messages.upsert', handler);
      activeMenuSessions.delete(m.sender);
    };

    // --- Attach Listener + Timeout ---
    const timeout = setTimeout(() => {
      Matrix.ev.off('messages.upsert', handler);
      activeMenuSessions.delete(m.sender);
    }, 120_000); // 2 minutes timeout

    activeMenuSessions.set(m.sender, { handler, timeout });
    Matrix.ev.on('messages.upsert', handler);

  } catch (error) {
    console.error('Menu Error:', error);
    await Matrix.sendMessage(m.from, {
      text: '⚠️ An error occurred while loading the menu. Please try again later.'
    }, { quoted: m });
  }
};

// Reset sessions on bot restart
activeMenuSessions.clear();

export default menu;
