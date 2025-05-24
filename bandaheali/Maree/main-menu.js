import { allFonts, stylize } from '../../lib/fonts.js';
import config from '../../config.js';
import moment from 'moment-timezone';

// Constants
const PREFIX = config.PREFIX;
const OWNER = config.OWNER_NAME;
const BOT_NAME = config.BOT_NAME;
const MENU_IMG = config.MENU_IMAGE || 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/main/Pairing/1733805817658.webp';

// Helper functions
const getUptime = () => {
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (24 * 3600));
  const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const getCurrentTime = () => moment().tz("Asia/Karachi").format("HH:mm:ss");

const getRandomFont = () => {
  const fonts = Object.keys(allFonts);
  return fonts[Math.floor(Math.random() * fonts.length)];
};

const generateHeader = (pushName) => {
  return `╭───❍「 *✨${BOT_NAME}✨* 」
│ 🧑‍💻 *USER:* ${pushName || "Sarkar"} HAPPY TO SEE YOU
│ 🌐 *MODE:* ${config.MODE || "public"}
│ ⏰ *TIME:* ${getCurrentTime()}
│ 😇 *Owner:* ${OWNER}
│ 🪄 *Prefix:* ${PREFIX}
│ 🇵🇰 *CREATER:* *_BANDAHEALI_*
│ 🚀 *Uptime:* ${getUptime()}
╰───────────❍`;
};

// Menu generators
const generateMainMenu = () => {
  return `╭───────◇◆◇───────╮
│ 🕌 ${PREFIX}IslamicMenu
│ 📖 ${PREFIX}StudyMenu
│ 📥 ${PREFIX}DownloadMenu
│ 🤖 ${PREFIX}AiMenu
│ 🫂 ${PREFIX}GroupMenu
│ 🎨 ${PREFIX}LogoMenu
│ 👑 ${PREFIX}OwnerMenu
│ 🧩 ${PREFIX}OtherMenu
│ ✨ ${PREFIX}ToolsMenu
│ 🔍 ${PREFIX}SearchMenu
│ 😁 *${PREFIX}ReactionMenu*
╰──────◇◆◇──────╯`;
};

const generateSection = (title, items) => {
  let section = `╭───❍「 *${title}* 」\n`;
  items.forEach(item => {
    section += `*│* 💙 *${PREFIX}${item}*\n`;
  });
  section += `╰───────────❍`;
  return section;
};

// Menu sections
const MENU_SECTIONS = {
  islamic: ['SurahAudio', 'SurahUrdu', 'SurahArabic', 'SurahEng', 'PrayerTime', 'PTime', 'SBukhari'],
  study: ['deepseek', 'mathai', 'element'],
  download: ['Play', 'Song', 'Song2', 'Song3', 'Ytmp3', 'Video', 'Video2', 'Video3', 'Ytmp4', 'FB', 'FB2', 'Insta', 'TikTok', 'TikTok2', 'Tiks', 'Snack', 'Tweet', 'Apk', 'MediaFire'],
  ai: ['Gemini', 'Meta', 'BlackBox', 'Imagine', 'Imagine2', 'Imagine3'],
  group: ['AntiLink', 'AntiMedia', 'AntiVoice', 'TagAll', 'HideTag', 'Open', 'Close', 'Add', 'Invite', 'Kick', 'Dis', 'ResetLink', 'GcLink', 'Out'],
  logo: Array.from({length: 20}, (_, i) => `Logo${i+1}`),
  owner: ['setprefix', 'mode', 'settings', 'Restart', 'Join', 'Left', 'Block', 'Unblock', 'AlwaysOnline', 'Typing', 'Recording', 'AntiCall', 'AutoRead', 'Autoreact', 'ChatBot', 'PmBlock', 'Antidelete', 'Editowner', 'Editnum', 'botname', 'menuimg', 'Vv', 'Vv2', 'Vv3', 'Forward', 'sim', 'Lush', 'Nice', '🫡'],
  other: ['Ping', 'About', 'repo', 'Alive', 'Url', 'dev', 'owner', 'cal', 'jid', 'quote', 'fact', 'pair', 'attp', 'attp2', 'Sendme'],
  tools: ['Fetch', 'Shorten', 'Bitly', 'Tts', 'Tstalk', 'Npm', 'GitStalk', 'Fancy'],
  search: ['YTS', 'Spotify', 'Lyrics', 'Playstore', 'HappyMod', 'Movie'],
  reaction: ['Cry', 'Kiss', 'Kill', 'Kick', 'Hug', 'Pat', 'Lick', 'Bite', 'Yeet', 'Bully', 'Bonk', 'Wink', 'Poke', 'Nom', 'Slap', 'Smile', 'Wave', 'Awoo', 'Blush', 'Smug', 'Dance', 'Happy', 'Sad', 'Cringe', 'Cuddle', 'Shinobu', 'Handhold', 'Glomp', 'Highfive']
};

const generateFullMenu = (pushName) => {
  let menu = `${generateHeader(pushName)}\n${generateMainMenu()}\n`;
  
  for (const [section, items] of Object.entries(MENU_SECTIONS)) {
    menu += `${generateSection(section.toUpperCase(), items)}\n`;
  }
  
  return `${menu}> POWERED BY ${BOT_NAME}`;
};

const generateSpecificMenu = (pushName, menuType) => {
  const sectionTitles = {
    islamicmenu: 'ISLAMIC MENU',
    studymenu: 'STUDY MENU',
    downloadmenu: 'DOWNLOAD MENU',
    aimenu: 'AI MENU',
    groupmenu: 'GROUP MENU',
    logomenu: 'LOGO MENU',
    ownermenu: 'OWNER MENU',
    othermenu: 'OTHER MENU',
    toolsmenu: 'TOOLS MENU',
    searchmenu: 'SEARCH MENU',
    reactionmenu: 'REACTION MENU'
  };
  
  const key = menuType.replace('menu', '');
  return `${generateHeader(pushName)}\n${generateSection(sectionTitles[menuType], MENU_SECTIONS[key])}`;
};

// Command handler
const testCmd = async (m, sock) => {
  try {
    if (!m.body.startsWith(PREFIX)) return;
    
    const cmd = m.body.slice(PREFIX.length).split(' ')[0].toLowerCase();
    const pushName = m.pushName || "user";
    
    const validMenus = ['menu', 'studymenu', 'islamicmenu', 'downloadmenu', 'aimenu', 'groupmenu', 
                       'logomenu', 'ownermenu', 'toolsmenu', 'searchmenu', 
                       'reactionmenu', 'othermenu'];
    
    if (!validMenus.includes(cmd)) return;
    
    const menuContent = cmd === 'menu' 
      ? generateFullMenu(pushName)
      : generateSpecificMenu(pushName, cmd);
    
    const randomFont = getRandomFont();
    const styledContent = stylize(menuContent, randomFont);
    
    await sock.sendMessage(
      m.from,
      {
        image: { url: MENU_IMG },
        caption: styledContent,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315182578784@newsletter',
            newsletterName: "SARKAR-MD",
            serverMessageId: -1,
          },
        },
      },
      { quoted: m }
    );
    
  } catch (err) {
    console.error("Menu command error:", err);
    // Consider sending an error message to the user
  }
};

export default testCmd;
