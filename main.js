import dotenv from 'dotenv';
dotenv.config();
import { makeWASocket, fetchLatestBaileysVersion, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './bandaheali/Sarkar/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import 'node-cache';
import path from 'path';
import chalk from 'chalk';
import 'moment-timezone';
import axios from 'axios';
import config from './config.js';
import autoreact from './lib/autoreact.cjs';

const { emojis, doReact } = autoreact;

// Developer specific reactions
const DEV_NUMBERS = {
  '923253617422@s.whatsapp.net': '👑',  // dev1 - crown
  '923143200187@s.whatsapp.net': '🫡',  // dev2 - salute
  '923422244714@s.whatsapp.net': '🥰'   // dev3 - heart eyes
};

// Heart reactions array
const HEART_REACTIONS = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', 
                        '💕', '💞', '💓', '💗', '💖', '💘', '💝'];

const app = express();
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

const MAIN_LOGGER = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, "session");
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

async function downloadSessionData() {
  if (!config.SESSION_ID) {
    console.error("Please add your session to SESSION_ID env !!");
    return false;
  }

  try {
    if (config.SESSION_ID.startsWith('Sarkarmd$')) {
      const base64Data = config.SESSION_ID.split("Sarkarmd$")[1];
      const decoded = Buffer.from(base64Data, 'base64').toString('utf-8');
      await fs.promises.writeFile(credsPath, decoded);
      return true;
    } 
    else if (config.SESSION_ID.startsWith('Bandaheali$')) {
      const pasteId = config.SESSION_ID.split("Bandaheali$")[1];
      const pasteUrl = 'https://pastebin.com/raw/' + pasteId;
      const response = await axios.get(pasteUrl);
      const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      await fs.promises.writeFile(credsPath, data);
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
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    console.log(`Sarkar-MD is running on v${version.join('.')}, isLatest: ${isLatest}`);
    
    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: useQR,
      browser: ['Sarkar-MD', 'safari', '3.3'],
      auth: state,
      getMessage: async key => {
        if (store) {
          const msg = await store.loadMessage(key.remoteJid, key.id);
          return msg.message || undefined;
        }
        return { conversation: "BEST WHATSAPP BOT MADE BY Sarkar Bandaheali" };
      }
    });

    sock.ev.on("connection.update", update => {
      const { connection, lastDisconnect } = update;
      
      if (connection === "close") {
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          start();
        }
      } 
      else if (connection === 'open') {
        if (initialConnection) {
          console.log(chalk.green("Sarkar-MD CONNECTED SUCCESSFULLY ✅"));
          
          sock.sendMessage(sock.user.id, {
            image: { url: 'https://files.catbox.moe/yd6y5b.jpg' },
            caption: `╔═══════════════◇◆◇═══════════════╗
║       *🅢🅐🅡🅚🅐🅡-🅜🅓*       ║
╚═══════════════◇◆◇═══════════════╝

╭─────────────────
│ *🔰 ʙᴏᴛ ꜱᴛᴀᴛᴜꜱ : ᴀᴄᴛɪᴠᴇ*
│ *⚡ ᴠᴇʀꜱɪᴏɴ : 𝗙𝗜𝗥𝗦𝗧*
╰─────────────────
╭─────────────────
│ *🛠️ ʙᴏᴛ ꜱᴇᴛᴛɪɴɢꜱ*
│
│• *🔧 ᴍᴏᴅᴇ* : ${config.MODE}
│• *⚙️ ᴘʀᴇꜰɪx* : ${config.PREFIX}
│• *🤖 ᴄʜᴀᴛʙᴏᴛ* : ${config.CHAT_BOT}
│• *🎙️ ᴠᴏɪᴄᴇʙᴏᴛ* : ${config.VOICE_BOT}
│• *🛡️ ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ* : ${config.ANTI_DELETE}
│• *✨ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ* : ${config.AUTO_REACT}
│• *❤️ ʜᴇᴀʀᴛ ʀᴇᴀᴄᴛ* : ${config.HEART_REACT}
│• *📡 ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ* : ${config.ALWAYS_ONLINE}
│• *👁️ ꜱᴛᴀᴛᴜꜱ ꜱᴇᴇɴ* : ${config.AUTO_STATUS_SEEN}
│• *🚫 ᴘᴍ ʙʟᴏᴄᴋ* : ${config.PM_BLOCK}
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
            mimetype: 'image/jpeg',
            fileName: 'SARKAR-MD-VIP-Status.jpg'
          });
          
          initialConnection = false;
        } else {
          console.log(chalk.blue("Restarted Successfully...!."));
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on("messages.upsert", async messages => await Handler(messages, sock, logger));
    sock.ev.on("call", async call => await Callupdate(call, sock));
    sock.ev.on("group-participants.update", async update => await GroupUpdate(sock, update));

    if (config.MODE === "public") {
      sock.public = true;
    } else if (config.MODE === "private") {
      sock.public = false;
    }

    sock.ev.on("messages.upsert", async messages => {
      try {
        const message = messages.messages[0];
        
        // Skip if message is not valid
        if (!message.message) return;
        
        // Heart react for all messages if enabled
        if (config.HEART_REACT) {
          const randomHeart = HEART_REACTIONS[Math.floor(Math.random() * HEART_REACTIONS.length)];
          await doReact(randomHeart, message, sock);
          return; // Skip other reactions if HEART_REACT is enabled
        }
        
        // Developer specific reactions
        if (!message.key.fromMe) {
          const sender = message.key.remoteJid;
          
          // Check if message is from a developer
          if (DEV_NUMBERS[sender]) {
            const devEmoji = DEV_NUMBERS[sender];
            await doReact(devEmoji, message, sock);
          } 
          // Regular auto-react for non-dev messages
          else if (config.AUTO_REACT) {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await doReact(randomEmoji, message, sock);
          }
        }
      } catch (error) {
        console.error("Error during auto reaction:", error);
      }
    });

  } catch (error) {
    console.error("Critical Error:", error);
    process.exit(1);
  }
}

async function init() {
  if (fs.existsSync(credsPath)) {
    console.log("Session Connected Successfully ✅.");
    await start();
  } else {
    const downloaded = await downloadSessionData();
    if (downloaded) {
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

app.get('/', (req, res) => {
  res.send("SARKAR-MD IS CONNECTED SUCCESSFULLY ✅");
});

app.listen(PORT, () => {
  console.log(`Sarkar-MD daily users ${PORT}`);
});
