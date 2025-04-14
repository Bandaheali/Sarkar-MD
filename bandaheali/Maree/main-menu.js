import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';
import axios from 'axios';

// System Information Functions
const formatBytes = (bytes) => {
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  while (bytes >= 1024 && unitIndex < units.length - 1) {
    bytes /= 1024;
    unitIndex++;
  }
  return `${bytes.toFixed(2)} ${units[unitIndex]}`;
};

const getUptime = () => {
  const uptime = process.uptime();
  const days = Math.floor(uptime / (24 * 3600));
  const hours = Math.floor((uptime % (24 * 3600)) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  return `*${days}d ${hours}h ${minutes}m ${seconds}s*`;
};

// Menu Configuration
const MENU_SECTIONS = {
  1: {
    title: "Download Menu",
    content: `
┃◈╭─────────────·๏
┃◈┃• ytmp3
┃◈┃• ytmp4
┃◈┃• tiktok
┃◈┃• play
┃◈┃• song
┃◈┃• video
┃◈└───────────┈⊷`
  },
  2: {
    title: "Converter Menu",
    content: `
┃◈╭─────────────·๏
┃◈┃• attp
┃◈┃• emojimix
┃◈┃• mp3
┃◈└───────────┈⊷`
  },
  3: {
    title: "AI Menu",
    content: `
┃◈╭─────────────·๏
┃◈┃• gpt
┃◈┃• dalle
┃◈┃• gemini
┃◈└───────────┈⊷`
  },
  4: {
    title: "Group Tools",
    content: `
┃◈╭─────────────·๏
┃◈┃• add
┃◈┃• kick
┃◈┃• promote
┃◈┃• demote
┃◈┃• tagall
┃◈└───────────┈⊷`
  },
  5: {
    title: "Search Menu",
    content: `
┃◈╭─────────────·๏
┃◈┃• google
┃◈┃• lyrics
┃◈┃• wallpaper
┃◈└───────────┈⊷`
  }
};

const menu = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const mode = config.MODE === 'public' ? 'public' : 'private';
  const time = moment.tz("Asia/Colombo");
  const pushwish = time.hour() < 5 ? "Good Morning 🌄" :
                   time.hour() < 11 ? "Good Morning 🌄" :
                   time.hour() < 15 ? "Good Afternoon 🌅" :
                   time.hour() < 18 ? "Good Evening 🌃" : "Good Night 🌌";

  try {
    // Get menu image once and reuse
    const menuImage = config.MENU_IMAGE?.trim() ? 
      (await axios.get(config.MENU_IMAGE, { responseType: 'arraybuffer' })).data : 
      fs.readFileSync('./assets/menu.jpg');

    // Send main menu
    const mainMenu = `
╭━━━〔 ${config.BOT_NAME} 〕━━━┈⊷
┃★╭──────────────
┃★│ Owner: ${config.OWNER_NAME}
┃★│ User: ${m.pushName}
┃★│ Uptime: ${getUptime()}
┃★│ Memory: ${formatBytes(os.freemem())}/${formatBytes(os.totalmem())}
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

${pushwish}!

╭━━〔 MAIN MENU 〕━━┈⊷
┃◈╭─────────────·๏
${Object.entries(MENU_SECTIONS).map(([num, section]) => 
  `┃◈┃• ${num}. ${section.title}`).join('\n')}
┃◈└───────────┈⊷
╰──────────────┈⊷
Reply with number (1-5)`;

    await Matrix.sendMessage(m.from, {
      image: menuImage,
      caption: mainMenu,
      mentions: [m.sender]
    }, { quoted: m });

    // Create response handler with cleanup
    const cleanup = () => {
      Matrix.ev.off('messages.upsert', responseHandler);
      clearTimeout(timeoutId);
    };

    const responseHandler = async (event) => {
      const msg = event.messages[0];
      if (!msg?.message || msg.key.remoteJid !== m.from || msg.key.fromMe) return;

      const choice = parseInt(msg.message.conversation || 
        msg.message.extendedTextMessage?.text || '');
      
      if (isNaN(choice) return cleanup();
      if (choice < 1 || choice > 5) return cleanup();

      const section = MENU_SECTIONS[choice];
      const response = `
╭━━━〔 ${section.title} 〕━━━┈⊷
┃★╭──────────────
┃★│ Prefix: ${prefix}
┃★│ Commands:
${section.content}
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷`;

      // Send submenu with image
      await Matrix.sendMessage(m.from, {
        image: menuImage,
        caption: response,
        mentions: [m.sender]
      }, { quoted: msg });

      cleanup();
    };

    // Set timeout for menu response (60 seconds)
    const timeoutId = setTimeout(cleanup, 60000);
    Matrix.ev.on('messages.upsert', responseHandler);

  } catch (error) {
    console.error('Menu Error:', error);
    await Matrix.sendMessage(m.from, { 
      text: "🚨 Error loading menu. Please try again later." 
    }, { quoted: m });
  }
};

export default menu;
