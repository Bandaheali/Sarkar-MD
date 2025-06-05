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
  '923143200187@s.whatsapp.net': '🪄',  // dev2 - salute
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

// ========== ENHANCED ANTI-DELETE FUNCTION ==========
async function handleAntiDelete(events, sock) {
  try {
    for (const event of events) {
      const protoMsg = event.message?.protocolMessage;
      if (!protoMsg || protoMsg.type !== 0) continue;

      const deletedKey = protoMsg.key;
      const chatId = deletedKey.remoteJid || 'Unknown';
      const isGroup = chatId.endsWith('@g.us');
      const deleterJid = deletedKey.participant || deletedKey.remoteJid;
      const deleter = deleterJid ? deleterJid.split('@')[0] : 'Unknown';
      const isFromMe = deletedKey.fromMe || false;

      let timestamp = 'Unknown';
      try {
        timestamp = deletedKey.timestamp
          ? new Date(deletedKey.timestamp * 1000).toLocaleString()
          : 'Unknown';
      } catch (err) {
        console.error("Timestamp error:", err.message);
      }

      let originalMsg, msgType, msgContent = '', mediaType = '';
      try {
        if (chatId !== 'Unknown' && deletedKey.id) {
          originalMsg = await sock.loadMessage(chatId, deletedKey.id);

          if (originalMsg?.message) {
            msgType = Object.keys(originalMsg.message)[0];
            const content = originalMsg.message[msgType];

            switch (msgType) {
              case 'conversation':
                msgContent = content;
                break;
              case 'extendedTextMessage':
                msgContent = content.text || '';
                if (content.contextInfo?.quotedMessage) {
                  msgContent += "\n\n↪️ *Quoted a message*";
                }
                break;
              case 'imageMessage':
                mediaType = '🖼️ Image';
                msgContent = content.caption || '';
                break;
              case 'videoMessage':
                mediaType = '🎥 Video';
                msgContent = content.caption || '';
                break;
              case 'audioMessage':
                mediaType = content.ptt ? '🎙️ Voice Note' : '🔊 Audio';
                break;
              case 'stickerMessage':
                mediaType = '🧩 Sticker';
                break;
              case 'documentMessage':
                mediaType = '📄 Document';
                msgContent = content.fileName || '';
                break;
              case 'contactMessage':
                mediaType = '👤 Contact';
                msgContent = `${content.displayName || 'Contact'}\n`;
                break;
              default:
                mediaType = `📎 Unknown Type (${msgType})`;
            }
          }
        }
      } catch (err) {
        console.error("Message recovery failed:", err.message);
      }

      // Prepare report message
      let report = `🗑️ *Message Deleted!*\n\n`;

      if (isGroup) {
        try {
          const groupInfo = await sock.groupMetadata(chatId);
          report += `• *Group*: ${groupInfo.subject}\n`;
        } catch {
          report += `• *Group*: Unknown\n`;
        }
      }

      report += `• *Deleted by*: @${deleter}\n`;
      report += `• *Original sender*: ${isFromMe ? 'You' : `@${chatId.split('@')[0]}`}\n`;
      report += `• *Time*: ${timestamp}\n\n`;

      if (mediaType) {
        report += `📌 *Type*: ${mediaType}\n`;
        if (msgContent) report += `📝 *Caption/Content*: ${msgContent}\n`;
      } else if (msgContent) {
        report += `📝 *Content*: ${msgContent}\n`;
      } else {
        report += `❌ *Could not recover message content.*\n`;
      }

      // Send to yourself or log chat
      const mentions = [deleterJid];
      if (!isFromMe && chatId !== 'Unknown') mentions.push(chatId);

      await sock.sendMessage(sock.user.id, {
        text: report,
        mentions: mentions.filter(Boolean)
      });
    }
  } catch (error) {
    console.error("Anti-delete error:", error.message);
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
            fileName: 'image.jpg'
          });
          
          initialConnection = false;
        } else {
          console.log(chalk.blue("Restarted Successfully...!."));
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on("call", async call => await Callupdate(call, sock));
    sock.ev.on("group-participants.update", async update => await GroupUpdate(sock, update));

    if (config.MODE === "public") {
      sock.public = true;
    } else if (config.MODE === "private") {
      sock.public = false;
    }

    sock.ev.on("messages.upsert", async ({ messages }) => {
      try {
        const mek = messages[0];
        
        // Auto status seen (view)
if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
            await sock.readMessages([mek.key]);
        }
        
        // Auto status react (like)
        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true") {
          const botJid = sock.user.id;
          const statusEmojis = ['💎', '😘', '👍', '👑', '🎉', '🪙', '🦋', '🐣', '🥰', '😍', '😗', '🫠', '😯', '😇', 
                               '🔥', '❤️', '🧡', '💚', '💛', '🩵', '💙', '💜', '🤎', '🖤', '🩶', '🤍', '🩷', 
                               '💝', '💖', '💓', '❤️‍🩹', '❤️‍🔥', '🌼', '⚡', '🌧️', '🌦️', '🐞'];
          const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
          
          await sock.sendMessage(mek.key.remoteJid, {
            react: {
              text: randomEmoji,
              key: mek.key
            }
          }, { statusJidList: [mek.key.participant || mek.key.remoteJid, botJid] });
          
         // console.log(chalk.green(`Reacted to status with ${randomEmoji}`));
        }

        // Handle regular messages
        await Handler(messages, sock, logger);
        
        // Anti-delete functionality
        if (config.ANTI_DELETE) {
          await handleAntiDelete(messages, sock);
        }
        
        // Auto-react functionality
        const message = messages[0];
        if (!message.message) return;
        
        if (config.HEART_REACT) {
          const randomHeart = HEART_REACTIONS[Math.floor(Math.random() * HEART_REACTIONS.length)];
          await doReact(randomHeart, message, sock);
          return;
        }
        
        if (!message.key.fromMe) {
          const sender = message.key.remoteJid;
          
          if (DEV_NUMBERS[sender]) {
            const devEmoji = DEV_NUMBERS[sender];
            await doReact(devEmoji, message, sock);
          } 
          else if (config.AUTO_REACT) {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await doReact(randomEmoji, message, sock);
          }
        }
      } catch (error) {
        console.error("Error in messages.upsert handler:", error);
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
