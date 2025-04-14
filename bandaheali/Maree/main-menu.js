import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import axios from 'axios';
import config from '../../config.cjs';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

// Helpers
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

const MENU_SECTIONS = {
  1: {
    title: "Download Menu",
    content: `
┃✦ • ytmp3
┃✦ • ytmp4
┃✦ • tiktok
┃✦ • play
┃✦ • song
┃✦ • video`
  },
  2: {
    title: "Converter Menu",
    content: `
┃✦ • attp
┃✦ • emojimix
┃✦ • mp3`
  },
  3: {
    title: "AI Menu",
    content: `
┃✦ • gpt
┃✦ • dalle
┃✦ • gemini`
  },
  4: {
    title: "Group Tools",
    content: `
┃✦ • add
┃✦ • kick
┃✦ • promote
┃✦ • demote
┃✦ • tagall`
  },
  5: {
    title: "Search Menu",
    content: `
┃✦ • google
┃✦ • lyrics
┃✦ • wallpaper`
  }
};

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "menu") {
    await m.react('⏳');

    const mode = config.MODE === 'public' ? 'Public' : 'Private';
    const time = moment.tz('Asia/Colombo');
    const greeting = time.hour() < 5 ? 'Good Night' :
                     time.hour() < 12 ? 'Good Morning' :
                     time.hour() < 17 ? 'Good Afternoon' : 'Good Evening';

    try {
      const menuImage = config.MENU_IMAGE?.trim()
        ? (await axios.get(config.MENU_IMAGE, { responseType: 'arraybuffer' })).data
        : fs.readFileSync('./assets/menu.jpg');

      const menuText = `
╭━━〔 *${config.BOT_NAME}* 〕━━⊷
┃✦ Owner: ${config.OWNER_NAME}
┃✦ User: ${m.pushName}
┃✦ Mode: ${mode}
┃✦ Uptime: ${getUptime()}
┃✦ RAM: ${formatBytes(os.freemem())} / ${formatBytes(os.totalmem())}
╰━━━━━━━━━━━━━━━⊷

${greeting}, *${m.pushName}*!

╭━〔 MAIN MENU 〕━⊷
${Object.entries(MENU_SECTIONS).map(([key, { title }]) => `┃✦ ${key}. ${title}`).join('\n')}
╰━━━━━━━━━━━━━━━⊷

_Reply to this message with 1-5 to view that section._`;

      const sentMsg = await sock.sendMessage(m.from, {
        image: menuImage,
        caption: menuText,
        mentions: [m.sender]
      }, { quoted: m });

      await m.react('✅'); // Success icon

      const userJid = m.sender;
      const mainMsgId = sentMsg.key.id;

      const responseHandler = async (event) => {
        const msg = event.messages?.[0];
        if (!msg || !msg.message || msg.key.remoteJid !== m.from || msg.key.fromMe) return;

        const senderJid = msg.key.participant || msg.key.remoteJid;
        if (senderJid !== userJid) return;

        const quotedMsgId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
        if (quotedMsgId !== mainMsgId) return;

        const text = msg.message.conversation || msg.message?.extendedTextMessage?.text;
        if (!text) return;

        const choice = parseInt(text.trim());
        if (!MENU_SECTIONS[choice]) return;

        const { title, content } = MENU_SECTIONS[choice];

        await sock.sendMessage(m.from, {
          text: `
╭━〔 *${title}* 〕━⊷
┃✦ Prefix: ${prefix}
┃✦ Commands:
${content}
╰━━━━━━━━━━━━━━━⊷`,
          mentions: [msg.sender || msg.participant]
        }, { quoted: msg });

        sock.ev.off('messages.upsert', responseHandler);
        clearTimeout(timeout);
      };

      sock.ev.on('messages.upsert', responseHandler);

      const timeout = setTimeout(() => {
        sock.ev.off('messages.upsert', responseHandler);
      }, 60000);

    } catch (err) {
      console.error('Menu Error:', err);
      await sock.sendMessage(m.from, {
        text: '⚠️ *Error loading menu. Try again later.*'
      }, { quoted: m });
    }
  }
};

export default menu;
