pimport { allFonts, stylize } from '../../lib/fonts.js';
import moment from 'moment-timezone';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import fs from 'fs';
import os from 'os';
import config from '../../config.cjs';
const testCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';
      const mode = config.MODE;
  const name = config.BOT_NAME;
  const owner = config.OWNER_NAME
  const pushName = m.pushName || 'User';
  
  const formatBytes = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};
const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (24 * 3600));
    const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    //realtime function
        const realTime = moment().tz("Asia/Karachi").format("HH:mm:ss");
// pushwish function
    let pushwish = "";
    
        if (realTime < "05:00:00") {
  pushwish = `𝙶𝙾𝙾𝙳 𝙼𝙾𝚁𝙽𝙸𝙽𝙶 🌄`;
} else if (realTime < "11:00:00") {
  pushwish = `𝙶𝙾𝙾𝙳 𝙼𝙾𝚁𝙽𝙸𝙽𝙶 🌄`;
} else if (realTime < "15:00:00") {
  pushwish = `𝙶𝙾𝙾𝙳 𝙰𝙵𝚃𝙴𝚁𝙽𝙾𝙾𝙽 🌅`;
} else if (realTime < "18:00:00") {
  pushwish = `𝙶𝙾𝙾𝙳 𝙴𝚅𝙴𝙽𝙸𝙽𝙶 🌃`;
} else if (realTime < "19:00:00") {
  pushwish = `𝙶𝙾𝙾𝙳 𝙴𝚅𝙴𝙽𝙸𝙽𝙶 🌃`;
} else {
  pushwish = `𝙶𝙾𝙾𝙳 𝙽𝙸𝙶𝙷𝚃 🌌`;
}

    if (cmd === 'test') {
      const fonts = Object.keys(allFonts);
      const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
      let menuMsg = `
╭───────◇◆◇───────╮
│ 🕌 ${prefix}IslamicMenu
│ 📥 ${prefix}DownloadMenu
│ 🤖 ${prefix}AiMenu
│ 🫂 ${prefix}GroupMenu
│ 🎨 ${prefix}LogoMenu
│ 👑 ${prefix}OwnerMenu
│ 🧩 ${prefix}OtherMenu
│ ✨ ${prefix}ToolsMenu
│ 🔍 ${prefix}SearchMenu
│ 🔍 ${prefix}ReactionMenu
╰──────◇◆◇──────╯
╭───❍「 *ISLAMIC MENU* 」
*│* 💙 *${prefix}SurahAudio*
*│* 💙 *${prefix}SurahUrdu*
*│* 💙 *${prefix}SurahArabic*
*│* 💙 *${prefix}SurahEng*
*│* 💙 *${prefix}PrayerTime*
*│* 💙 *${prefix}PTime*
*│* 💙 *${prefix}SBukhari*  
╰───────────❍
╭───❍「 DOWNLOAD MENU 」
*│* 💙 *${prefix}Play*
*│* 💙 *${prefix}Song*
*│* 💙 *${prefix}Song2*
*│* 💙 *${prefix}Song3*
*│* 💙 *${prefix}Ytmp3*
*│* 💙 *${prefix}Video*
*│* 💙 *${prefix}Video2*
*│* 💙 *${prefix}Video3*
*│* 💙 *${prefix}Ytmp4*
*│* 💙 *${prefix}FB*
*│* 💙 *${prefix}FB2*
*│* 💙 *${prefix}Insta*
*│* 💙 *${prefix}Insta*
*│* 💙 *${prefix}TikTok*
*│* 💙 *${prefix}TikTok2*
*│* 💙 *${prefix}Tiks*
*│* 💙 *${prefix}Snack*
*│* 💙 *${prefix}Tweet*
*│* 💙 *${prefix}Apk*
╰───────────❍
╭───❍「 *AI MENU* 」
*│* 💙 *${prefix}AI*
*│* 💙 *${prefix}GPT*
*│* 💙 *${prefix}BlackBox*
*│* 💙 *${prefix}Imagine*
*│* 💙 *${prefix}Imagine2*
*│* 💙 *${prefix}Imagine3*
╰───────────❍
╭───❍「 *GROUP MENU* 」
*│* 💙 *${prefix}AntiLink*
*│* 💙 *${prefix}AntiMedia*
*│* 💙 *${prefix}AntiVoice*
*│* 💙 *${prefix}TagAll*
*│* 💙 *${prefix}HideTag*
*│* 💙 *${prefix}Open*
*│* 💙 *${prefix}Close*
*│* 💙 *${prefix}Add*
*│* 💙 *${prefix}Invite*
*│* 💙 *${prefix}Kick*
*│* 💙 *${prefix}Dis*
*│* 💙 *${prefix}ResetLink*
*│* 💙 *${prefix}GcLink* 
*│* 💙 *${prefix}Out*
╰───────────❍
╭───❍「 *LOGO MENU* 」
*┋* © *${prefix}Logo*
*┋* ©️ *${prefix}Logo1*
*┋* ©️ *${prefix}Logo2*
*┋* ©️ *${prefix}Logo3*
*┋* ©️ *${prefix}Logo4*
*┋* ©️ *${prefix}Logo5*
*┋* ©️ *${prefix}Logo6*
*┋* ©️ *${prefix}Logo6*
*┋* ©️ *${prefix}Logo7*
*┋* ©️ *${prefix}Logo8*
*┋* ©️ *${prefix}Logo9*
*┋* ©️ *${prefix}Logo10*
*┋* ©️ *${prefix}Logo11*
*┋* ©️ *${prefix}Logo12*
*┋* ©️ *${prefix}Logo13*
*┋* ©️ *${prefix}Logo14*
*┋* ©️ *${prefix}Logo15*
*┋* ©️ *${prefix}Logo16*
*┋* ©️ *${prefix}Logo17*
*┋* ©️ *${prefix}Logo18*
*┋* ©️ *${prefix}Logo19*
*┋* ©️ *${prefix}Logo20*
╰───────────❍
╭───❍「 *OWNER MENU* 」
*│* 💙 *${prefix}setprefix*
*│* 💙 *${prefix}mode*
*│* 💙 *${prefix}settings*
*│* 💙 *${prefix}Restart*
*│* 💙 *${prefix}Join*
*│* 💙 *${prefix}Left*
*│* 💙 *${prefix}Block*
*│* 💙 *${prefix}Unblock*
*│* 💙 *${prefix}AlwaysOnline*
*│* 💙 *${prefix}Typing*
*│* 💙 *${prefix}Recoding*
*│* 💙 *${prefix}AntiCall*
*│* 💙 *${prefix}AutoRead*
*│* 💙 *${prefix}Autoreact*
*│* 💙 *${prefix}ChatBot*
*│* 💙 *${prefix}PmBlock*
*│* 💙 *${prefix}Antidelete*
*│* 💙 *${prefix}Editowner*
*│* 💙 *${prefix}Editnum*
*│* 💙 *${prefix}botname*
*│* 💙 *${prefix}menuimg*
*│* 💙 *${prefix}Vv*
*│* 💙 *${prefix}Vv2*
*│* 💙 *${prefix}Vv3*
*│* 💙 *${prefix}Forward*
*│* 💙 *Lush*
*│* 💙 *Nice*
*│* 💙 *🫡*
╰───────────❍
╭───❍「 *OTHER MENU* 」
*│* 🗿 *${prefix}Ping*
*│* 🗿 *${prefix}About*
*│* 🗿 *${prefix}repo*
*│* 🗿 *${prefix}Alive*
*│* 🗿 *${prefix}Url*
*│* 🗿 *${prefix}dev*
*│* 🗿 *${prefix}owner*
*│* 🗿 *Sendme*
╰───────────❍ 
╭───❍「 *TOOLS MENU* 」
*│* 💙 *${prefix}Fetch*
*│* 💙 *${prefix}Shorten*
*│* 💙 *${prefix}Bitly*
*│* 💙 *${prefix}Tts*
*│* 💙 *${prefix}Tstalk*
*│* 💙 *${prefix}Npm*
*│* 💙 *${prefix}GitStalk*
╰───────────❍
╭───❍「 *SEARCH MENU* 」
*│* 💙 *${prefix}YTS*
*│* 💙 *${prefix}Spotify*
*│* 💙 *${prefix}Lyrics*
*│* 💙 *${prefix}Playstore*
╰───────────❍
╭───❍「 *REACTION MENU* 」
*│* 💙 *${prefix}Cry*
*│* 💙 *${prefix}Kiss*
*│* 💙 *${prefix}Kill*
*│* 💙 *${prefix}Kick*
*│* 💙 *${prefix}Hug*
*│* 💙 *${prefix}Pat*
*│* 💙 *${prefix}Lick*
*│* 💙 *${prefix}Bite*
*│* 💙 *${prefix}Yeet*
*│* 💙 *${prefix}Bully*
*│* 💙 *${prefix}Bonk*
*│* 💙 *${prefix}Wink*
*│* 💙 *${prefix}Poke*
*│* 💙 *${prefix}Nom*
*│* 💙 *${prefix}Slap*
*│* 💙 *${prefix}Smile*
*│* 💙 *${prefix}Wave*
*│* 💙 *${prefix}Awoo*
*│* 💙 *${prefix}Blush*
*│* 💙 *${prefix}Smug*
*│* 💙 *${prefix}Dance*
*│* 💙 *${prefix}Happy*
*│* 💙 *${prefix}Sad*
*│* 💙 *${prefix}Cringe*
*│* 💙 *${prefix}Cuddle*
*│* 💙 *${prefix}Shinobu*
*│* 💙 *${prefix}Handhold*
*│* 💙 *${prefix}Glomp*
*│* 💙 *${prefix}Highfive*
╰───────────❍
> POWERED BY ${name}
`;

      const msg = stylize(menuMsg, randomFont);

      await sock.sendMessage(m.from, { text: msg }, { quoted: m });
    }
  } catch (err) {
    console.error('Test command error:', err);
    await sock.sendMessage(m.from, {
      text: `❌ *Error:* ${err.toString().substring(0, 150)}`
    }, { quoted: m });
  }
};

export default testCmd;

