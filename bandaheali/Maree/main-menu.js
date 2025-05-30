import { allFonts, stylize } from '../../lib/fonts.js';
import { readFileSync } from 'fs';
import moment from 'moment-timezone';

// Dynamic config loader
const loadConfig = () => {
  try {
    // Using dynamic import to get fresh config each time
    const configPath = new URL('../../config.js', import.meta.url).pathname;
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  } catch (err) {
    console.error('Config loading error:', err);
    return {
      PREFIX: '.',
      OWNER_NAME: 'Owner',
      BOT_NAME: 'Bot',
      MENU_IMAGE: 'https://example.com/default.jpg',
      MODE: 'public'
    };
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
  const { BOT_NAME, MODE, OWNER_NAME, PREFIX } = loadConfig();
  return `╭───❍「 *✨${BOT_NAME}✨* 」
│ 🧑‍💻 *USER:* ${pushName || "User"} HAPPY TO SEE YOU
│ 🌐 *MODE:* ${MODE}
│ ⏰ *TIME:* ${getCurrentTime()}
│ 😇 *Owner:* ${OWNER_NAME}
│ 🪄 *Prefix:* ${PREFIX}
│ 🇵🇰 *CREATER:* *_BANDAHEALI_*
│ 🚀 *Uptime:* ${getUptime()}
╰───────────❍`;
};

// Menu generators
const generateMainMenu = () => {
  const { PREFIX } = loadConfig();
  return `╭───────◇◆◇───────╮
│ 🕌 ${PREFIX}IslamicMenu
│ 📖 ${PREFIX}StudyMenu
│ 📥 ${PREFIX}DownloadMenu
│ 🤖 ${PREFIX}AiMenu
│ 🫂 ${PREFIX}GroupMenu
│ 🎨 ${PREFIX}LogoMenu
│ 👑 ${PREFIX}OwnerMenu
│ 🧩 ${PREFIX}OtherMenu
│ 🤣 ${PREFIX}FunMenu
│ ✨ ${PREFIX}ToolsMenu
│ 🔍 ${PREFIX}SearchMenu
│ 😁 ${PREFIX}ReactionMenu
╰──────◇◆◇──────╯`;
};

const generateSection = (title, items) => {
  const { PREFIX } = loadConfig();
  let section = `╭───❍「 *${title}* 」\n`;
  items.forEach(item => {
    section += `*│* 💙 *${PREFIX}${item}*\n`;
  });
  section += `╰───────────❍`;
  return section;
};

// Menu sections (unchanged)
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
  const { BOT_NAME } = loadConfig();
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
    const config = loadConfig();
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
        image: { url: config.MENU_IMAGE },
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
