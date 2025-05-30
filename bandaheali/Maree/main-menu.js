import { allFonts, stylize } from '../../lib/fonts.js';
import { readFileSync } from 'fs';
import moment from 'moment-timezone';

// Helper function to get fresh config
const getConfig = () => {
  try {
    const configFile = readFileSync('./config.js', 'utf-8');
    // Extract the config object from the file
    const configMatch = configFile.match(/export\s+default\s+({[\s\S]*?});/);
    if (configMatch) {
      // Note: This is a simple approach - for more complex configs, consider using import()
      return eval(`(${configMatch[1]})`);
    }
    return {};
  } catch (err) {
    console.error('Error reading config:', err);
    return {};
  }
};

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
  const config = getConfig();
  return `╭───❍「 *✨${config.BOT_NAME || 'BOT'}✨* 」
│ 🧑‍💻 *USER:* ${pushName || "User"} HAPPY TO SEE YOU
│ 🌐 *MODE:* ${config.MODE || "public"}
│ ⏰ *TIME:* ${getCurrentTime()}
│ 😇 *Owner:* ${config.OWNER_NAME || 'Owner'}
│ 🪄 *Prefix:* ${config.PREFIX || '.'}
│ 🇵🇰 *CREATER:* *_BANDAHEALI_*
│ 🚀 *Uptime:* ${getUptime()}
╰───────────❍`;
};

// Menu generators
const generateMainMenu = () => {
  const config = getConfig();
  return `╭───────◇◆◇───────╮
│ 🕌 ${config.PREFIX || '.'}IslamicMenu
│ 📖 ${config.PREFIX || '.'}StudyMenu
│ 📥 ${config.PREFIX || '.'}DownloadMenu
│ 🤖 ${config.PREFIX || '.'}AiMenu
│ 🫂 ${config.PREFIX || '.'}GroupMenu
│ 🎨 ${config.PREFIX || '.'}LogoMenu
│ 👑 ${config.PREFIX || '.'}OwnerMenu
│ 🧩 ${config.PREFIX || '.'}OtherMenu
│ 🤣 ${config.PREFIX || '.'}FunMenu
│ ✨ ${config.PREFIX || '.'}ToolsMenu
│ 🔍 ${config.PREFIX || '.'}SearchMenu
│ 😁 ${config.PREFIX || '.'}ReactionMenu
╰──────◇◆◇──────╯`;
};

const generateSection = (title, items) => {
  const config = getConfig();
  let section = `╭───❍「 *${title}* 」\n`;
  items.forEach(item => {
    section += `*│* 💙 *${config.PREFIX || '.'}${item}*\n`;
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
  other: ['Sim', 'Ping', 'Ping2', 'About', 'repo', 'Alive', 'Url', 'dev', 'owner', 'cal', 'jid', 'quote', 'fact', 'pair', 'attp', 'attp2', 'Sendme'],
  tools: ['Fetch', 'Shorten', 'Bitly', 'Tts', 'Tstalk', 'Npm', 'GitStalk', 'Fancy'],
  fun: ['emojimix', 'quote', 'fun', 'roast', 'qc'],
  search: ['YTS', 'Spotify', 'Lyrics', 'Playstore', 'HappyMod', 'Movie'],
  reaction: ['Cry', 'Kiss', 'Kill', 'Kick', 'Hug', 'Pat', 'Lick', 'Bite', 'Yeet', 'Bully', 'Bonk', 'Wink', 'Poke', 'Nom', 'Slap', 'Smile', 'Wave', 'Awoo', 'Blush', 'Smug', 'Dance', 'Happy', 'Sad', 'Cringe', 'Cuddle', 'Shinobu', 'Handhold', 'Glomp', 'Highfive']
};

const generateFullMenu = (pushName) => {
  let menu = `${generateHeader(pushName)}\n${generateMainMenu()}\n`;
  
  for (const [section, items] of Object.entries(MENU_SECTIONS)) {
    menu += `${generateSection(section.toUpperCase(), items)}\n`;
  }
  
  const config = getConfig();
  return `${menu}> POWERED BY ${config.BOT_NAME || 'BOT'}`;
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
    funmenu: 'FUN MENU',
    toolsmenu: 'TOOLS MENU',
    searchmenu: 'SEARCH MENU',
    reactionmenu: 'REACTION MENU'
  };
  
  const key = menuType.replace('menu', '');
  return `${generateHeader(pushName)}\n${generateSection(sectionTitles[menuType], MENU_SECTIONS[key])}`;
};

// Command handler
const menuCmd = async (m, sock) => {
  try {
    const config = getConfig();
    const prefix = config.PREFIX || '.';
    
    if (!m.body.startsWith(prefix)) return;
    
    const cmd = m.body.slice(prefix.length).split(' ')[0].toLowerCase();
    const pushName = m.pushName || "user";
    
    const validMenus = ['menu', 'studymenu', 'islamicmenu', 'downloadmenu', 'aimenu', 'groupmenu', 
                       'logomenu', 'ownermenu', 'funmenu', 'toolsmenu', 'searchmenu', 
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
        image: { url: config.MENU_IMAGE || 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/main/Pairing/1733805817658.webp' },
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

export default menuCmd;
