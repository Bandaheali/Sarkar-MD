import config from '../../config.js';
import { promises } from 'fs';
import { join } from 'path';
import moment from 'moment-timezone';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "test") {
    await m.React('⏳'); // Loading reaction
    
    // User info
    const name = await sock.getName(m.sender);
    const date = moment.tz("Asia/Karachi").format("DD/MM/YYYY");
    const time = moment.tz("Asia/Karachi").format("hh:mm A");
    
    // Menu template
    const menuText = `
╭──「 *Sarkar-MD MENU* 」──╮
│
│ 👋 *Hello,* ${name}
│ 📅 ${date}  🕒 ${time}
│
╰─────────────────╯
╭──「 *MAIN CATEGORIES* 」──╮
│
│ 📥 Download Menu
│ 🕌 Islamic Menu
│ 👥 Group Menu
│ 👑 Owner Menu
│ 🔍 Search Menu
│ 🛠️ Other Tools
│
╰─────────────────╯
`.trim();

    await m.React('✅'); // Success reaction

    await sock.sendMessage(
      m.from,
      {
        text: menuText,
        footer: "🔻 Select a category below",
        buttons: [
          {
            buttonId: `${prefix}dlmenu`,
            buttonText: { displayText: "📥 Download" },
            type: 1
          },
          {
            buttonId: `${prefix}islamicmenu`,
            buttonText: { displayText: "🕌 Islamic" },
            type: 1
          },
          {
            buttonId: `${prefix}groupmenu`,
            buttonText: { displayText: "👥 Group" },
            type: 1
          },
          {
            buttonId: `${prefix}ownermenu`,
            buttonText: { displayText: "👑 Owner" },
            type: 1
          },
          {
            buttonId: `${prefix}searchmenu`,
            buttonText: { displayText: "🔍 Search" },
            type: 1
          },
          {
            buttonId: `${prefix}othermenu`,
            buttonText: { displayText: "🛠️ Other" },
            type: 1
          }
        ],
        headerType: 1,
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315182578784@newsletter',
            newsletterName: "Sarkar-MD",
            serverMessageId: -1,
          },
          forwardingScore: 999,
          externalAdReply: {
            title: "✨ Sarkar-MD MAIN MENU ✨",
            body: "All bot features at your fingertips",
            thumbnailUrl: 'https://qu.ax/axfte.jpg', // Replace with your image
            sourceUrl: 'https://www.bandaheali.site', // Replace with your repo
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
  }
};

// Helper function to format time
function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

export default menu;
