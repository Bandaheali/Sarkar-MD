import dotenv from 'dotenv';
dotenv.config();
import { makeWASocket, fetchLatestBaileysVersion, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './bandaheali/Sarkar/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import axios from 'axios';
import config from './config.cjs';
import autoreact from './lib/autoreact.cjs';

const { emojis, doReact } = autoreact;

// Initialize Express app
const app = express();
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

// Logger setup
const mainLogger = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = mainLogger.child({});
logger.level = "trace";

// Session directory setup
const currentDir = path.dirname(new URL(import.meta.url).pathname;
const sessionDir = path.join(currentDir, "session");
const credsPath = path.join(sessionDir, 'creds.json');

// Create session directory if it doesn't exist
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

/**
 * Downloads session data from Pastebin
 * @returns {Promise<boolean>} True if download was successful
 */
async function downloadSessionData() {
  if (!config.SESSION_ID) {
    console.error("Please add your session to SESSION_ID env !!");
    return false;
  }
  
  const pastebinId = config.SESSION_ID.split("Sarkarmd$")[1];
  const pastebinUrl = `https://pastebin.com/raw/${pastebinId}`;
  
  try {
    const response = await axios.get(pastebinUrl);
    const sessionData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    await fs.promises.writeFile(credsPath, sessionData);
    console.log("🌏 Sarkar-MD ONLINE 🌏");
    return true;
  } catch (error) {
    console.error("Failed to download session data:", error);
    return false;
  }
}

/**
 * Starts the WhatsApp connection
 */
async function startBot() {
  try {
    // Initialize authentication state
    const { state: authState, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    // Get latest Baileys version
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Sarkar-MD is running on v${version.join('.')}, isLatest: ${isLatest}`);
    
    // Create WhatsApp socket connection
    const sock = makeWASocket({
      version: version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: useQR,
      browser: ['Ethix-MD', 'safari', '3.3'],
      auth: authState,
      getMessage: async (key) => {
        // Placeholder for message retrieval
        return {
          conversation: "BEST WHATSAPP BOT MADE BY Sarkar Bandaheali"
        };
      }
    });

    // Connection update handler
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === "close") {
        // Reconnect if not logged out
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          startBot();
        }
      } else if (connection === 'open') {
        if (initialConnection) {
          console.log(chalk.green("Sarkar-MD CONNECTED SUCCESSFULLY ✅"));
          // Send connection success message
          sock.sendMessage(sock.user.id, {
            text: `╭─────────────━┈⊷
│ *Sarkar is connected*
╰─────────────━┈⊷

╭─────────────━┈⊷
│🤖 Bot Name: *Sarkar-MD*
│👨‍💻 Owner : *Sarkar Bandaheali*
╰─────────────━┈⊷

*Message Me on WhatsApp 😈*
_https://wa.me/923253617422_`
          });
          initialConnection = false;
        } else {
          console.log(chalk.blue("Restarted Successfully...!."));
        }
      }
    });

    // Event handlers
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on("messages.upsert", async (messages) => await Handler(messages, sock, logger));
    sock.ev.on("call", async (call) => await Callupdate(call, sock));
    sock.ev.on("group-participants.update", async (update) => await GroupUpdate(sock, update));
    
    // Set public/private mode
    sock.public = config.MODE === "public";
    
    // Auto-react to messages if enabled
    if (config.AUTO_REACT) {
      sock.ev.on("messages.upsert", async (messages) => {
        try {
          const message = messages.messages[0];
          if (!message.key.fromMe && message.message) {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await doReact(randomEmoji, message, sock);
          }
        } catch (error) {
          console.error("Error during auto reaction:", error);
        }
      });
    }
  } catch (error) {
    console.error("Critical Error:", error);
    process.exit(1);
  }
}

/**
 * Initializes the bot
 */
async function initialize() {
  if (fs.existsSync(credsPath)) {
    console.log("Session Connected Successfully ✅.");
    await startBot();
  } else {
    const downloadSuccess = await downloadSessionData();
    if (downloadSuccess) {
      console.log("Sarkar-MD IS RUNNING...⏳");
      await startBot();
    } else {
      console.log("Session ID error ❌ - Falling back to QR code");
      useQR = true;
      await startBot();
    }
  }
}

// Start the bot
initialize();

// Express routes
app.get('/', (req, res) => {
  res.send("SARKAR-MD IS CONNECTED SUCCESSFULLY ✅");
});

app.listen(PORT, () => {
  console.log(`Sarkar-MD daily users ${PORT}`);
});
