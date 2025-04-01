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

// Enhanced logger setup
const logger = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
  level: 'trace'
}).child({ module: 'main' });

// Session directory setup
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const sessionDir = path.join(__dirname, "session");
const credsPath = path.join(sessionDir, 'creds.json');

// Ensure session directory exists
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
  logger.info('Created session directory');
}

/**
 * Downloads session data from Pastebin
 */
async function downloadSessionData() {
  if (!config.SESSION_ID) {
    logger.error("SESSION_ID not found in config!");
    return false;
  }
  
  try {
    const pastebinId = config.SESSION_ID.split("Sarkarmd$")[1];
    const pastebinUrl = `https://pastebin.com/raw/${pastebinId}`;
    
    logger.debug(`Fetching session from: ${pastebinUrl}`);
    const response = await axios.get(pastebinUrl, {
      timeout: 10000 // 10 second timeout
    });
    
    const sessionData = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data);
    
    await fs.promises.writeFile(credsPath, sessionData);
    logger.info("Session data downloaded successfully");
    return true;
  } catch (error) {
    logger.error({ error }, "Failed to download session data");
    return false;
  }
}

/**
 * Initializes WhatsApp connection
 */
async function startWhatsApp() {
  try {
    logger.info("Initializing WhatsApp connection...");
    
    const { state: authState, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    logger.info(`Using Baileys v${version.join('.')}, Latest: ${isLatest}`);
    
    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: useQR,
      browser: ['Sarkar-MD', 'safari', '3.3'],
      auth: authState,
      getMessage: async (key) => {
        return { conversation: "Sarkar-MD WhatsApp Bot" };
      }
    });

    // Connection event handlers
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.warn(`Connection closed. ${shouldReconnect ? 'Reconnecting...' : 'Not reconnecting'}`);
        
        if (shouldReconnect) {
          setTimeout(startWhatsApp, 5000); // Reconnect after 5 seconds
        }
      } 
      else if (connection === 'open') {
        if (initialConnection) {
          logger.info("Connected successfully");
          initialConnection = false;
          
          // Send connection notification
          sock.sendMessage(sock.user.id, {
            text: `╭─────────────━┈⊷
│ *Sarkar-MD Connected*
╰─────────────━┈⊷

╭─────────────━┈⊷
│🤖 Version: ${version.join('.')}
│👨‍💻 Owner: Sarkar Bandaheali
╰─────────────━┈⊷`
          }).catch(e => logger.error(e, "Failed to send connection message"));
        } else {
          logger.info("Reconnected successfully");
        }
      }
    });

    // Credentials update handler
    sock.ev.on('creds.update', saveCreds);

    // Message handler
    sock.ev.on("messages.upsert", async (messages) => {
      try {
        await Handler(messages, sock, logger);
        
        // Auto-react if enabled
        if (config.AUTO_REACT) {
          const message = messages.messages[0];
          if (message && !message.key.fromMe && message.message) {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await doReact(randomEmoji, message, sock);
          }
        }
      } catch (error) {
        logger.error(error, "Error handling message");
      }
    });

    // Call handler
    sock.ev.on("call", async (call) => {
      try {
        await Callupdate(call, sock);
      } catch (error) {
        logger.error(error, "Error handling call");
      }
    });

    // Group update handler
    sock.ev.on("group-participants.update", async (update) => {
      try {
        await GroupUpdate(sock, update);
      } catch (error) {
        logger.error(error, "Error handling group update");
      }
    });

    // Set public/private mode
    sock.public = config.MODE === "public";
    logger.info(`Running in ${sock.public ? 'public' : 'private'} mode`);

  } catch (error) {
    logger.fatal(error, "Critical error in WhatsApp connection");
    process.exit(1);
  }
}

/**
 * Main initialization
 */
async function initialize() {
  try {
    if (fs.existsSync(credsPath)) {
      logger.info("Using existing session credentials");
      await startWhatsApp();
    } else {
      logger.info("No session found, attempting download...");
      const downloadSuccess = await downloadSessionData();
      
      if (downloadSuccess) {
        await startWhatsApp();
      } else {
        logger.warn("Falling back to QR code authentication");
        useQR = true;
        await startWhatsApp();
      }
    }
  } catch (error) {
    logger.fatal(error, "Initialization failed");
    process.exit(1);
  }
}

// Express setup
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    bot: 'Sarkar-MD',
    owner: 'Sarkar Bandaheali'
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start everything
initialize();

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  logger.info("Shutting down gracefully...");
  server.close(() => {
    process.exit(0);
  });
});
