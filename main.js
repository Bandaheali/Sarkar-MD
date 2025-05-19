import _0x2f665a from 'dotenv';
_0x2f665a.config();
import { makeWASocket, fetchLatestBaileysVersion, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './bandaheali/Sarkar/index.js';
import _0x4ecc7b from 'express';
import _0x416691 from 'pino';
import _0x5687e2 from 'fs';
import 'node-cache';
import _0x374270 from 'path';
import _0x4b0fc4 from 'chalk';
import 'moment-timezone';
import _0x5a7360 from 'axios';
import _0xccedb8 from './config.js';
import _0x11fa72 from './lib/autoreact.cjs';
const {
  emojis,
  doReact
} = _0x11fa72;
const app = _0x4ecc7b();
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 0xbb8;
const MAIN_LOGGER = _0x416691({
  'timestamp': () => ",\"time\":\"" + new Date().toJSON() + "\""
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";
const __filename = new URL(import.meta.url).pathname;
const __dirname = _0x374270.dirname(__filename);
const sessionDir = _0x374270.join(__dirname, "session");
const credsPath = _0x374270.join(sessionDir, 'creds.json');
if (!_0x5687e2.existsSync(sessionDir)) {
  _0x5687e2.mkdirSync(sessionDir, {
    'recursive': true
  });
}
async function downloadSessionData() {
  if (!_0xccedb8.SESSION_ID) {
    console.error("Please add your session to SESSION_ID env !!");
    return false;
  }

  try {
    if (_0xccedb8.SESSION_ID.startsWith('Sarkarmd$')) {
      // Handle Base64 encoded session
      const base64Data = _0xccedb8.SESSION_ID.split("Sarkarmd$")[1];
      const decoded = Buffer.from(base64Data, 'base64').toString('utf-8');
      await _0x5687e2.promises.writeFile(credsPath, decoded);
      return true;
    } 
    else if (_0xccedb8.SESSION_ID.startsWith('Bandaheali$')) {
      // Handle Pastebin session
      const pasteId = _0xccedb8.SESSION_ID.split("Bandaheali$")[1];
      const pasteUrl = 'https://pastebin.com/raw/' + pasteId;
      const response = await _0x5a7360.get(pasteUrl);
      const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      await _0x5687e2.promises.writeFile(credsPath, data);
      return true;
    }
    else {
      console.log('Unknown session format');
      return false;
    }
  } catch (error) {
    console.error('Session download failed:', error);
    return false;
  }
}
async function start() {
  try {
    const {
      state: _0x1fda07,
      saveCreds: _0x356b55
    } = await useMultiFileAuthState(sessionDir);
    const {
      version: _0x2f6d2f,
      isLatest: _0x23f0a4
    } = await fetchLatestBaileysVersion();
    console.log("Sarkar-MD is running on v" + _0x2f6d2f.join('.') + ", isLatest: " + _0x23f0a4);
    const _0x76bf4 = makeWASocket({
      'version': _0x2f6d2f,
      'logger': _0x416691({
        'level': 'silent'
      }),
      'printQRInTerminal': useQR,
      'browser': ['Sarkar-MD', 'safari', '3.3'],
      'auth': _0x1fda07,
      'getMessage': async _0x53ca5a => {
        if (store) {
          const _0x406fd9 = await store.loadMessage(_0x53ca5a.remoteJid, _0x53ca5a.id);
          return _0x406fd9.message || undefined;
        }
        return {
          'conversation': "BEST WHATSAPP BOT MADE BY Sarkar Bandaheali"
        };
      }
    });
    _0x76bf4.ev.on("connection.update", _0x4eb449 => {
      const {
        connection: _0x237ed1,
        lastDisconnect: _0x1b5c1d
      } = _0x4eb449;
      if (_0x237ed1 === "close") {
        if (_0x1b5c1d.error?.["output"]?.["statusCode"] !== DisconnectReason.loggedOut) {
          start();
        }
      } else if (_0x237ed1 === 'open') {
        if (initialConnection) {
          console.log(_0x4b0fc4.green("Sarkar-MD CONNECTED SUCCESSFULLY ✅"));
_0x76bf4.sendMessage(_0x76bf4.user.id, {
    'image': { 
        url: 'https://files.catbox.moe/yd6y5b.jpg'
    },
    'caption': `╔═══════════════◇◆◇═══════════════╗
║       *🅢🅐🅡🅚🅐🅡-🅜🅓*       ║
╚═══════════════◇◆◇═══════════════╝

╭─────────────────
│ *🔰 ʙᴏᴛ ꜱᴛᴀᴛᴜꜱ : ᴀᴄᴛɪᴠᴇ*
│ *⚡ ᴠᴇʀꜱɪᴏɴ : 𝗙𝗜𝗥𝗦𝗧*
╰─────────────────
╭─────────────────
│ *🛠️ ʙᴏᴛ ꜱᴇᴛᴛɪɴɢꜱ*
│
│• *🔧 ᴍᴏᴅᴇ* : ${_0xccedb8.MODE}
│• *⚙️ ᴘʀᴇꜰɪx* : ${_0xccedb8.PREFIX}
│• *🤖 ᴄʜᴀᴛʙᴏᴛ* : ${_0xccedb8.CHAT_BOT}
│• *🎙️ ᴠᴏɪᴄᴇʙᴏᴛ* : ${_0xccedb8.VOICE_BOT}
│• *🛡️ ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ* : ${_0xccedb8.ANTI_DELETE}
│• *✨ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ* : ${_0xccedb8.AUTO_REACT}
│• *📡 ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ* : ${_0xccedb8.ALWAYS_ONLINE}
│• *👁️ ꜱᴛᴀᴛᴜꜱ ꜱᴇᴇɴ* : ${_0xccedb8.AUTO_STATUS_SEEN}
│• *🚫 ᴘᴍ ʙʟᴏᴄᴋ* : ${_0xccedb8.PM_BLOCK}
╰─────────────────
╭─────────────────
│ *📌 ꜱᴜᴘᴘᴏʀᴛ ʟɪɴᴋꜱ*
│
│• *📢 ᴏꜰꜰɪᴄɪᴀʟ ᴄʜᴀɴɴᴇʟ* :
│  https://whatsapp.com/channel/0029VajGHyh2phHOH5zJl73P
│
│• *👥 ꜱᴜᴘᴘᴏʀᴛ ɢʀᴏᴜᴘ* :
│  https://chat.whatsapp.com/C5js5lDia5Y8dcAoXj4mpq
╰─────────────────
╔═══════════════◇◆◇═══════════════╗
║  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꜱᴀʀᴋᴀʀ-ᴍᴅ*  ║
╚═══════════════◇◆◇═══════════════╝`,
    'mimetype': 'image/jpeg',
    'fileName': 'SARKAR-MD-VIP-Status.jpg'
});
          initialConnection = false;
        } else {
          console.log(_0x4b0fc4.blue("Restarted Successfully...!."));
        }
      }
    });
    _0x76bf4.ev.on('creds.update', _0x356b55);
    _0x76bf4.ev.on("messages.upsert", async _0x2d963c => await Handler(_0x2d963c, _0x76bf4, logger));
    _0x76bf4.ev.on("call", async _0x516b51 => await Callupdate(_0x516b51, _0x76bf4));
    _0x76bf4.ev.on("group-participants.update", async _0x128e02 => await GroupUpdate(_0x76bf4, _0x128e02));
    if (_0xccedb8.MODE === "public") {
      _0x76bf4['public'] = true;
    } else if (_0xccedb8.MODE === "private") {
      _0x76bf4["public"] = false;
    }
    _0x76bf4.ev.on("messages.upsert", async _0x2e7a5a => {
      try {
        const _0x4282ef = _0x2e7a5a.messages[0x0];
        if (!_0x4282ef.key.fromMe && _0xccedb8.AUTO_REACT) {
          console.log(_0x4282ef);
          if (_0x4282ef.message) {
            const _0x4d275d = emojis[Math.floor(Math.random() * emojis.length)];
            await doReact(_0x4d275d, _0x4282ef, _0x76bf4);
          }
        }
      } catch (_0x3beab8) {
        console.error("Error during auto reaction:", _0x3beab8);
      }
    });
  } catch (_0x324507) {
    console.error("Critical Error:", _0x324507);
    process.exit(0x1);
  }
}
async function init() {
  if (_0x5687e2.existsSync(credsPath)) {
    console.log("Session Connected Successfully ✅.");
    await start();
  } else {
    const _0x17d9d4 = await downloadSessionData();
    if (_0x17d9d4) {
      console.log("Sarkar-MD IS RUNNING...⏳");
      await start();
    } else {
      console.log("Session id error ❌");
      useQR = true;
      await start();
    }
  }
}
init();
app.get('/', (_0x1ecf21, _0x282bcc) => {
  _0x282bcc.send("SARKAR-MD IS CONNECTED SUCCESSFULLY ✅");
});
app.listen(PORT, () => {
  console.log("Sarkar-MD daily users " + PORT);
});
