import dotenv from 'dotenv';
dotenv.config();
import { makeWASocket, fetchLatestBaileysVersion, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './bandaheali/Sarkar/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import axios from 'axios';
import config from './config.cjs';
import { emojis, doReact } from './lib/autoreact.cjs';

// Initialize with performance optimizations
const app = express();
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

// Turbocharged logger with async logging
const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  },
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
}).child({ module: 'Sarkar-MD' });

// Memory-efficient session handling
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const sessionDir = path.join(__dirname, "session");
const credsPath = path.join(sessionDir, 'creds.json');

// Cache for frequently accessed data
const cache = new Map();

// Async session directory setup
async function setupSession() {
  try {
    await fs.access(sessionDir);
  } catch {
    await fs.mkdir(sessionDir, { recursive: true });
    logger.debug('Session directory created');
  }
}

// High-performance session download
async function downloadSessionData() {
  if (!config.SESSION_ID) {
    logger.error('SESSION_ID missing in config');
    return false;
  }

  try {
    const pastebinId = config.SESSION_ID.split("Sarkarmd$")[1];
    const pastebinUrl = `https://pastebin.com/raw/${pastebinId}`;
    
    logger.debug(`Fetching session from ${pastebinUrl}`);
    const { data } = await axios.get(pastebinUrl, {
      timeout: 5000,
      responseType: 'json'
    });

    await fs.writeFile(credsPath, typeof data === 'string' ? data : JSON.stringify(data));
    logger.info('Session data downloaded successfully');
    return true;
  } catch (error) {
    logger.error({ error }, 'Session download failed');
    return false;
  }
}

// Optimized WhatsApp connection
async function startWhatsApp() {
  try {
    const [{ state: authState, saveCreds }, { version }] = await Promise.all([
      useMultiFileAuthState(sessionDir),
      fetchLatestBaileysVersion()
    ]);

    logger.info(`Initializing WhatsApp v${version.join('.')}`);

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'error' }), // Only log errors
      printQRInTerminal: useQR,
      auth: authState,
      browser: ['Sarkar-MD', 'Edge', '12.0'],
      markOnlineOnConnect: true,
      syncFullHistory: false,
      generateHighQualityLinkPreview: true,
      getMessage: async () => ({ conversation: 'Sarkar-MD Active' })
    });

    // Event handlers with performance optimizations
    const handlers = {
      'connection.update': (update) => {
        if (update.connection === 'close') {
          const shouldReconnect = update.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          logger.warn(`Connection closed. ${shouldReconnect ? 'Reconnecting...' : ''}`);
          shouldReconnect && setTimeout(startWhatsApp, 2000);
        } else if (update.connection === 'open') {
          logger.info('Connected to WhatsApp');
          if (initialConnection) {
            notifyOwner(sock, version);
            initialConnection = false;
          }
        }
      },
      'creds.update': saveCreds,
      'messages.upsert': async (m) => {
        try {
          await Handler(m, sock, logger);
          config.AUTO_REACT && await autoReact(m, sock);
        } catch (error) {
          logger.error(error, 'Message handling error');
        }
      },
      'call': (call) => Callupdate(call, sock).catch(e => logger.error(e, 'Call error')),
      'group-participants.update': (update) => GroupUpdate(sock, update).catch(e => logger.error(e, 'Group update error'))
    };

    Object.entries(handlers).forEach(([event, handler]) => sock.ev.on(event, handler));

    sock.public = config.MODE === "public";
    logger.info(`Running in ${sock.public ? 'PUBLIC' : 'PRIVATE'} mode`);

  } catch (error) {
    logger.fatal(error, 'WhatsApp initialization failed');
    process.exit(1);
  }
}

// Helper functions
async function autoReact({ messages }, sock) {
  const message = messages[0];
  if (message && !message.key.fromMe && message.message) {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    await doReact(emoji, message, sock).catch(e => logger.debug(e, 'React failed'));
  }
}

async function notifyOwner(sock, version) {
  try {
    await sock.sendMessage(sock.user.id, {
      text: `╭─────────────━┈⊷\n│ *Sarkar-MD ONLINE*\n╰─────────────━┈⊷\n\n` +
            `Version: ${version.join('.')}\n` +
            `Mode: ${config.MODE.toUpperCase()}\n` +
            `Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`
    });
  } catch (error) {
    logger.error(error, 'Failed to send connection message');
  }
}

// Fast initialization
async function initialize() {
  await setupSession();
  
  if (await fs.access(credsPath).then(() => true).catch(() => false)) {
    await startWhatsApp();
  } else if (await downloadSessionData()) {
    await startWhatsApp();
  } else {
    useQR = true;
    await startWhatsApp();
  }
}

// High-performance Express server
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/', (req, res) => res.status(200).json({
  status: 'online',
  uptime: process.uptime(),
  memory: process.memoryUsage()
}));

app.get('/health', (req, res) => res.sendStatus(200));

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  initialize().catch(error => {
    logger.fatal(error, 'Startup failed');
    process.exit(1);
  });
});

// Graceful shutdown
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    logger.info(`Received ${signal}, shutting down...`);
    server.close(() => process.exit(0));
  });
});
