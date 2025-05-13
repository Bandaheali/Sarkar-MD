import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './bandaheali/Sarkar/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import { File } from 'megajs';
import NodeCache from 'node-cache';
import path from 'path';
import chalk from 'chalk';
import moment from 'moment-timezone';
import axios from 'axios';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
const { emojis, doReact } = pkg;
const prefix = process.env.PREFIX || config.PREFIX;
const sessionName = "session";
const app = express();
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

const MAIN_LOGGER = pino({
    timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const msgRetryCounterCache = new NodeCache();
const dev = 923253617422;
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

async function downloadSessionData() {
    console.log("Debugging SESSION_ID:", config.SESSION_ID);

    if (!config.SESSION_ID) {
        console.error('Please add your session to SESSION_ID env !!');
        return false;
    }

    const sessdata = config.SESSION_ID.split("Sarkar-MD~")[1];
    if (!sessdata) {
        console.error('❌ Please set DROPBOX_SESSION_URL in your environment variables or config!');
        return false;
    }
    const dropboxUrl = "https://www.dropbox.com/" + sessdata;

    try {
        console.log("🔄 Downloading session from Dropbox...");
        const response = await axios.get(dropboxUrl, {
            responseType: 'arraybuffer'
        });

        await fs.promises.writeFile(credsPath, response.data);
        console.log("🔒 Session successfully loaded from Dropbox!");
        return true;
    } catch (error) {
        console.error('❌ Failed to download session from Dropbox:', error.message);
        return false;
    }
}

async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);
        
        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["JOEL-MD", "safari", "3.3"],
            auth: state,
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg.message || undefined;
                }
                return { conversation: "whatsapp user bot" };
            }
        });

Matrix.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            start();
        }
    } else if (connection === 'open') {
        if (initialConnection) {
            console.log(chalk.green("Connected Successfull"));
            Matrix.sendMessage(Matrix.user.id, { 
                image: { url: "https://files.catbox.moe/qc3td7.jpg" }, 
                caption: `╭──────────────◆
│     *SARKAR-MD IS ACTIVE AND READY*
├───────────────────────────────
│ ✅ *STATUS      : ONLINE*
│ ⚙️ *MODE        : ${config.MODE}*
│ 🏷️ *PREFIX      : ${config.PREFIX}*
│ 👀 *AUTO STATUS : ${config.AUTO_STATUS_SEEN}*
│ 👑 *OWNER       : ${config.OWNER_NAME}*
│ ☎️ *CONTACT     : wa.me/${dev}*
╰──────────────◆

╭──────────────◆
│ 🔗 *OFFICIAL GROUP:* 
│ https://chat.whatsapp.com/C5js5lDia5Y8dcAoXj4mpq
│
│ 📢 *OFFICIAL CHANNEL:* 
│ https://whatsapp.com/channel/0029VajGHyh2phHOH5zJl73P
╰──────────────◆

⚠️ *REPORT ANY BUGS OR ISSUES TO THE OWNER*

╭──────────────◆
│   ✨ THANK YOU FOR USING
│       *SARKAR-MD*
│   YOUR TRUST, OUR POWER ⚡
╰──────────────◆`
            });
            initialConnection = false;
        } else {
            console.log(chalk.blue("♻️ Connection reestablished after restart."));
        }
    }
});
        
        Matrix.ev.on('creds.update', saveCreds);

        Matrix.ev.on("messages.upsert", async chatUpdate => await Handler(chatUpdate, Matrix, logger));
        Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
        Matrix.ev.on("group-participants.update", async (messag) => await GroupUpdate(Matrix, messag));

        if (config.MODE === "public") {
            Matrix.public = true;
        } else if (config.MODE === "private") {
            Matrix.public = false;
        }

        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                console.log(mek);
                if (!mek.key.fromMe && config.AUTO_REACT) {
                    console.log(mek);
                    if (mek.message) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, mek, Matrix);
                    }
                }
            } catch (err) {
                console.error('Error during auto reaction:', err);
            }
        });
        
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
    try {
        const mek = chatUpdate.messages[0];
        const fromJid = mek.key.participant || mek.key.remoteJid;
        if (!mek || !mek.message) return;
        if (mek.key.fromMe) return;
        if (mek.message?.protocolMessage || mek.message?.ephemeralMessage || mek.message?.reactionMessage) return; 
        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
            await Matrix.readMessages([mek.key]);
            
            if (config.AUTO_STATUS_REPLY) {
                const customMessage = config.STATUS_READ_MSG || '✅ Auto Status Seen Bot';
                await Matrix.sendMessage(fromJid, { text: customMessage }, { quoted: mek });
            }

            // React to the status message with ❤️ if SLIKE is enabled
            if (config.SLIKE) {
                const emoji = '❤️';  // Use the ❤️ emoji for auto-react
                console.log(`Reacting to status with emoji: ${emoji}`);
                await doReact(emoji, mek, Matrix);
            }
        }
    } catch (err) {
        console.error('Error handling messages.upsert event:', err);
    }
});

    } catch (error) {
        console.error('Critical Error:', error);
        process.exit(1);
    }
}

async function init() {
    if (fs.existsSync(credsPath)) {
        console.log("🔒 Session file found, proceeding without QR code.");
        await start();
    } else {
        const sessionDownloaded = await downloadSessionData();
        if (sessionDownloaded) {
            console.log("🔒 Session downloaded, starting bot.");
            await start();
        } else {
            console.log("No session found or downloaded, QR code will be printed for authentication.");
            useQR = true;
            await start();
        }
    }
}

init();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
