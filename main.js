// Import required modules
import dotenv from 'dotenv';
dotenv.config();

import { 
  makeWASocket, 
  fetchLatestBaileysVersion, 
  DisconnectReason, 
  useMultiFileAuthState 
} from '@whiskeysockets/baileys';

import { 
  messageHandler, 
  callHandler, 
  groupHandler 
} from './bandaheali/Sarkar/index.js';

import express from 'express';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import axios from 'axios';
import config from './config.js';
import { emojis, autoReact } from './lib/autoreact.js';

// Initialize Express app
const app = express();
let useQR = false;
let isFirstConnection = true;

// Server port (default: 3000)
const PORT = process.env.PORT || 3000;

// Logger setup
const logger = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`
});

// Directory paths
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const sessionDir = path.join(__dirname, "session");
const credsPath = path.join(sessionDir, 'creds.json');

// Create session directory if it doesn't exist
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

// ======================
//  SESSION MANAGEMENT
// ======================
async function downloadSession() {
  if (!config.SESSION_ID) {
    console.error("❌ Please set SESSION_ID in .env!");
    return false;
  }

  try {
    if (config.SESSION_ID.startsWith('Sarkarmd$')) {
      // Handle Base64 session
      const base64Data = config.SESSION_ID.split("Sarkarmd$")[1];
      const decodedSession = Buffer.from(base64Data, 'base64').toString('utf-8');
      await fs.promises.writeFile(credsPath, decodedSession);
      return true;
    } 
    else if (config.SESSION_ID.startsWith('Bandaheali$')) {
      // Handle Pastebin session
      const pasteId = config.SESSION_ID.split("Bandaheali$")[1];
      const response = await axios.get(`https://pastebin.com/raw/${pasteId}`);
      const sessionData = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      await fs.promises.writeFile(credsPath, sessionData);
      return true;
    }
    else {
      console.log('⚠️ Unknown session format');
      return false;
    }
  } catch (error) {
    console.error('🚨 Session download failed:', error);
    return false;
  }
}

// ======================
//  BOT INITIALIZATION
// ======================
async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`🤖 Sarkar-MD running on v${version.join('.')} | Latest: ${isLatest}`);

    const bot = makeWASocket({
      version,
      logger: pino({ level: 'silent' }), // Disable Baileys logs
      printQRInTerminal: useQR,
      browser: ['Sarkar-MD', 'safari', '3.3'],
      auth: state,
      getMessage: async (key) => {
        // Custom message retrieval logic (optional)
        return { conversation: "BEST WHATSAPP BOT BY Sarkar Bandaheali" };
      }
    });

    // ======================
    //  EVENT HANDLERS
    // ======================
    bot.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "close") {
        if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          console.log("🔌 Connection lost... Reconnecting");
          startBot(); // Auto-reconnect
        }
      } 
      else if (connection === 'open') {
        if (isFirstConnection) {
          console.log(chalk.green("✅ Sarkar-MD Connected Successfully!"));
          sendStartupMessage(bot);
          isFirstConnection = false;
        } else {
          console.log(chalk.blue("🔄 Bot Restarted"));
        }
      }
    });

    // Update credentials when needed
    bot.ev.on('creds.update', saveCreds);

    // Core handlers
    bot.ev.on("messages.upsert", async (msg) => await messageHandler(msg, bot, logger));
    bot.ev.on("call", async (call) => await callHandler(call, bot));
    bot.ev.on("group-participants.update", async (update) => await groupHandler(bot, update));

    // Auto-react feature
    if (config.AUTO_REACT) {
      bot.ev.on("messages.upsert", async (msg) => {
        try {
          const message = msg.messages[0];
          if (!message.key.fromMe && message.message) {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await autoReact(randomEmoji, message, bot);
          }
        } catch (error) {
          console.error("❌ Auto-react failed:", error);
        }
      });
    }

    // Set public/private mode
    bot.public = config.MODE === "public";

  } catch (error) {
    console.error("💀 CRITICAL ERROR:", error);
    process.exit(1);
  }
}

// ======================
//  HELPER FUNCTIONS
// ======================
function sendStartupMessage(bot) {
  bot.sendMessage(bot.user.id, {
    image: { url: 'https://files.catbox.moe/yd6y5b.jpg' },
    caption: `
╔═══════════════◇◆◇═══════════════╗
║       *🅢🅐🅡🅚🅐🅡-🅜🅓*       ║
╚═══════════════◇◆◇═══════════════╝

╭─────────────────
│ *🔰 Bot Status: Active*
│ *⚡ Version: FIRST*
╰─────────────────
╭─────────────────
│ *🛠️ Bot Settings*
│
│• *🔧 Mode*: ${config.MODE}
│• *⚙️ Prefix*: ${config.PREFIX}
│• *🤖 ChatBot*: ${config.CHAT_BOT}
│• *🎙️ VoiceBot*: ${config.VOICE_BOT}
│• *🛡️ Anti-Delete*: ${config.ANTI_DELETE}
│• *✨ Auto-React*: ${config.AUTO_REACT}
│• *📡 Always Online*: ${config.ALWAYS_ONLINE}
│• *👁️ Status Seen*: ${config.AUTO_STATUS_SEEN}
│• *🚫 PM Block*: ${config.PM_BLOCK}
╰─────────────────
╭─────────────────
│ *📌 Support Links*
│
│• *📢 Official Channel*:
│  https://whatsapp.com/channel/0029VajGHyh2phHOH5zJl73P
│
│• *👥 Support Group*:
│  https://chat.whatsapp.com/C5js5lDia5Y8dcAoXj4mpq
╰─────────────────
╔═══════════════◇◆◇═══════════════╗
║  *Powered by Sarkar-MD*  ║
╚═══════════════◇◆◇═══════════════╝`,
    mimetype: 'image/jpeg',
    fileName: 'SARKAR-MD-Status.jpg'
  });
}

// ======================
//  START THE BOT
// ======================
async function initialize() {
  if (fs.existsSync(credsPath)) {
    console.log("🔑 Session found. Connecting...");
    await startBot();
  } else {
    const isSessionDownloaded = await downloadSession();
    if (isSessionDownloaded) {
      console.log("⬇️ Session downloaded. Starting bot...");
      await startBot();
    } else {
      console.log("❌ No valid session. Falling back to QR login.");
      useQR = true;
      await startBot();
    }
  }
}

// Start the Express server
app.get('/', (req, res) => {
  res.send("🚀 Sarkar-MD is running!");
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

// Launch the bot
initialize();
