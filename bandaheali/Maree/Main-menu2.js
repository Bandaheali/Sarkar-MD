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
  title: "🕌 𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𝗠𝗘𝗡𝗨",
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
  title: "📥 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗠𝗘𝗡𝗨",
  commands: [
    { name: "𝗣𝗹𝗮𝘆", desc: "Play music" },
    { name: "𝐒𝐨𝐧𝐠", desc: "Download Song" },
    { name: "𝐒𝐨𝐧𝐠2", desc: "Download Song 2" },
    { name: "𝐒𝐨𝐧𝐠3", desc: "Download Song 3" },
    { name: "𝐕𝐢𝐝𝐞𝐨", desc: "Download Video" },
    { name: "𝐕𝐢𝐝𝐞𝐨2", desc: "Download Video 2" },
    { name: "𝐕𝐢𝐝𝐞𝐨3", desc: "Download Video 3" },
    { name: "𝐅𝐁", desc: "Facebook Downloader" },
    { name: "𝐅𝐁2", desc: "Facebook Downloader 2" },
    { name: "𝐈𝐧𝐬𝐭𝐚", desc: "Instagram Downloader" },
    { name: "𝐓𝐢𝐤𝐓𝐨𝐤", desc: "TikTok Downloader" },
    { name: "𝐓𝐢𝐤𝐓𝐨𝐤2", desc: "TikTok Downloader 2" },
    { name: "𝐓𝐢𝐤𝐬", desc: "TikTok Short Video" },
    { name: "𝐒𝐧𝐚𝐜𝐤", desc: "Snack Video Downloader" },
    { name: "𝐓𝐰𝐞𝐞𝐓", desc: "Twitter Video Downloader" },
    { name: "𝐀𝐩𝐤", desc: "Download APK file" }
  ]
},
3: {
  title: "🤖 AI Menu",
  commands: [
    { name: "𝐀𝐈", desc: "Chat with AI" },
    { name: "𝐆𝐏𝐓", desc: "ChatGPT Powered AI" },
    { name: "𝐁𝐥𝐚𝐜𝐤𝐁𝐨𝐱", desc: "Code Generator AI" },
    { name: "𝐈𝐦𝐚𝐠𝐢𝐧𝐞", desc: "AI Image Generator 1" },
    { name: "𝐈𝐦𝐚𝐠𝐢𝐧𝐞2", desc: "AI Image Generator 2" },
    { name: "𝐈𝐦𝐚𝐠𝐢𝐧𝐞3", desc: "AI Image Generator 3" }
  ]
},
  4: {
  title: "👥 Group Menu",
  commands: [
    { name: "𝗧𝗮𝗴𝗔𝗹𝗹", desc: "Mention all group members" },
    { name: "𝗛𝗶𝗱𝗲𝗧𝗮𝗴", desc: "Tag silently without notifications" },
    { name: "𝗢𝗽𝗲𝗻", desc: "Open group (allow messages)" },
    { name: "𝗖𝗹𝗼𝘀𝗲", desc: "Close group (admins only messages)" },
    { name: "𝗔𝗱𝗱", desc: "Add member to group" },
    { name: "𝗜𝗻𝘃𝗶𝘁𝗲", desc: "Generate group invite link" },
    { name: "𝗞𝗶𝗰𝗸", desc: "Remove member from group" },
    { name: "𝗗𝗶𝘀", desc: "active group disappearing msg" }
  ]
  },
  5: {
  title: "🎨 Logo Menu",
  commands: [
    { name: "𝐋𝐨𝐆𝐨", desc: "Create a logo" },
    { name: "𝐆𝐥𝐨𝐬𝐬𝐲𝐒𝐢𝐥𝐯𝐞𝐫", desc: "Glossy Silver Text" },
    { name: "𝐖𝐫𝐢𝐭𝐞𝐓𝐞𝐱𝐭", desc: "Custom Text Writer" },
    { name: "𝐁𝐥𝐚𝐜𝐤𝐏𝐢𝐧𝐤𝐋𝐨𝐠𝐨", desc: "Blackpink Logo Style" },
    { name: "𝐆𝐥𝐢𝐭𝐜𝐡𝐓𝐞𝐱𝐭", desc: "Glitch Text Effect" },
    { name: "𝐀𝐝𝐯𝐚𝐧𝐜𝐞𝐝𝐆𝐥𝐨𝐰", desc: "Advanced Glow Effect" },
    { name: "𝐓𝐲𝐩𝐨𝐆𝐫𝐚𝐩𝐡𝐲𝐓𝐞𝐱𝐭", desc: "Typography Text" },
    { name: "𝐏𝐢𝐱𝐞𝐥𝐆𝐥𝐢𝐭𝐜𝐡", desc: "Pixel Glitch Logo" },
    { name: "𝐍𝐞𝐨𝐧𝐆𝐥𝐢𝐭𝐜𝐡", desc: "Neon Glitch Effect" },
    { name: "𝐃𝐞𝐥𝐞𝐭𝐢𝐧𝐠𝐓𝐞𝐱𝐭", desc: "Deleting Text Effect" },
    { name: "𝐁𝐥𝐚𝐜𝐤𝐏𝐢𝐧𝐤𝐒𝐭𝐲𝐥𝐞", desc: "Blackpink Style Text" },
    { name: "𝐆𝐥𝐨𝐰𝐢𝐧𝐠𝐓𝐞𝐱𝐭", desc: "Glowing Text Generator" },
    { name: "𝐔𝐧𝐝𝐞𝐫𝐖𝐚𝐭𝐞𝐫", desc: "Underwater Text Effect" },
    { name: "𝐋𝐨𝐠𝐨𝐌𝐚𝐤𝐞𝐫", desc: "General Logo Maker" },
    { name: "𝐂𝐚𝐫𝐭𝐨𝐨𝐧𝐒𝐭𝐲𝐥𝐞", desc: "Cartoon Style Logo" },
    { name: "𝐏𝐚𝐩𝐞𝐫𝐂𝐮𝐭", desc: "Paper Cut Style Text" },
    { name: "𝐌𝐮𝐥𝐭𝐢𝐂𝐨𝐥𝐨𝐫𝐞𝐝", desc: "Multicolored Text Logo" },
    { name: "𝐄𝐟𝐟𝐞𝐜𝐭𝐂𝐥𝐨𝐮𝐝𝐬", desc: "Cloud Effects Text" },
    { name: "𝐆𝐫𝐚𝐝𝐢𝐞𝐧𝐭𝐓𝐞𝐱𝐭", desc: "Gradient Text Style" }
  ]
  },
  6: {
  title: "🛠️ Owner Menu",
  commands: [
    { name: "𝐀𝐥𝐥𝐯𝐚𝐫", desc: "View all environment variables" },
    { name: "𝐀𝐝𝐝𝐕𝐚𝐫", desc: "Add a new variable" },
    { name: "𝐄𝐝𝐢𝐭𝐕𝐚𝐫", desc: "Edit an existing variable" },
    { name: "𝐑𝐞𝐬𝐭𝐚𝐫𝐭", desc: "Restart the bot" },
    { name: "𝗝𝗼𝗶𝗻", desc: "Join a group using invite link" },
    { name: "𝗟𝗲𝗳𝘁", desc: "Leave a group" },
    { name: "𝗕𝗹𝗼𝗰𝗸", desc: "Block a user" },
    { name: "𝗨𝗻𝗕𝗹𝗼𝗰𝗸", desc: "Unblock a user" },
    { name: "𝗔𝘂𝘁𝗼𝗿𝗲𝗮𝗰𝘁", desc: "random reacts on users msg" },
    { name: "𝗔𝗻𝘁𝗶𝗖𝗮𝗹𝗹", desc: "Reject calls automatically" },
    { name: "𝗠𝗼𝗱𝗲", desc: "Change mode" },
    { name: "𝗦𝗲𝘁𝗽𝗿𝗲𝗳𝗶𝘅", desc: "change prefix" }
    
  ]
  },
  7: {
  title: "📦 Other Menu",
  commands: [
    { name: "𝐏𝐢𝐧𝐠", desc: "Check bot speed and latency" },
    { name: "𝐀𝐥𝐢𝐯𝐞", desc: "Show alive message" }, 
    { name: "𝐔𝐩𝐓𝐢𝐦𝐞", desc: "Check bot uptime" },
    { name: "𝐑𝐞𝐩𝐨", desc: "Show bot GitHub repo" },
    { name: "𝐀𝐛𝐨𝐮𝐭", desc: "Get bot info and credits" },
    { name: "𝗤𝘂𝗼𝘁𝗲", desc: "Get a random Quote" }
  ]
  },
  8: {
  title: "🧰 Tools Menu",
  commands: [
    { name: "𝐅𝐞𝐭𝐜𝐡", desc: "Fetch webpage data or API" },
    { name: "𝐒𝐡𝐨𝐫𝐭𝐞𝐧", desc: "Shorten a long URL" },
    { name: "𝐓𝐭𝐬", desc: "Text to Speech converter" },
    { name: "𝐓𝐬𝐭𝐚𝐥𝐤", desc: "Text to Talk chatbot" },
    { name: "𝐍𝐩𝐦", desc: "Get NPM package info" },
    { name: "𝐆𝐢𝐭𝐒𝐭𝐚𝐥𝐤", desc: "GitHub user info & stats" }
  ]
  },
  9: {
  title: "🔍 Search Menu",
  commands: [
    { name: "𝐘𝐓𝐒", desc: "Search YouTube videos" },
    { name: "𝐒𝐬𝐩𝐨𝐭𝐢𝐟𝐲", desc: "Search songs on Spotify" },
    { name: "𝐋𝐲𝐫𝐢𝐜𝐬", desc: "Find lyrics of any song" },
    { name: "𝐏𝐥𝐚𝐲𝐬𝐭𝐨𝐫𝐞", desc: "Search apps on Play Store" }
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
