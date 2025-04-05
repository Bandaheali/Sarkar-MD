import pkg from '@whiskeysockets/baileys';
const { proto, downloadContentFromMessage } = pkg;
import config from '../../config.cjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Database file path
const DB_FILE = path.join(process.cwd(), 'antidelete.db');

class AntiDeleteSystem {
    constructor() {
        this.enabled = false;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.db = null;
        this.initializeDatabase();
    }

    async initializeDatabase() {
        try {
            this.db = await open({
                filename: DB_FILE,
                driver: sqlite3.Database
            });

            await this.db.exec(`
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    content TEXT,
                    media BLOB,
                    type TEXT,
                    mimetype TEXT,
                    sender TEXT,
                    senderFormatted TEXT,
                    timestamp INTEGER,
                    chatJid TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp);
            `);

            this.cleanupInterval = setInterval(() => this.cleanExpiredMessages(), this.cacheExpiry);
        } catch (error) {
            console.error('Database initialization error:', error);
        }
    }

    async addMessage(key, message) {
        try {
            await this.db.run(
                `INSERT OR REPLACE INTO messages VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    key,
                    message.content,
                    message.media,
                    message.type,
                    message.mimetype,
                    message.sender,
                    message.senderFormatted,
                    message.timestamp,
                    message.chatJid
                ]
            );
        } catch (error) {
            console.error('Error adding message:', error);
        }
    }

    async deleteMessage(key) {
        try {
            await this.db.run(`DELETE FROM messages WHERE id = ?`, [key]);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    }

    async getMessage(key) {
        try {
            return await this.db.get(`SELECT * FROM messages WHERE id = ?`, [key]);
        } catch (error) {
            console.error('Error getting message:', error);
            return null;
        }
    }

    async cleanExpiredMessages() {
        try {
            const expiryTime = Date.now() - this.cacheExpiry;
            await this.db.run(`DELETE FROM messages WHERE timestamp < ?`, [expiryTime]);
        } catch (error) {
            console.error('Error cleaning expired messages:', error);
        }
    }

    formatTime(timestamp) {
        const options = {
            timeZone: 'Asia/Karachi',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        return new Date(timestamp).toLocaleString('en-PK', options) + ' (PKT)';
    }

    async destroy() {
        clearInterval(this.cleanupInterval);
        if (this.db) {
            await this.db.close();
        }
    }
}

const antiDelete = new AntiDeleteSystem();

const AntiDelete = async (m, Matrix) => {
    const prefix = config.PREFIX;
    const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
    const text = m.body?.slice(prefix.length).trim().split(' ') || [];
    const cmd = text[0]?.toLowerCase();
    const subCmd = text[1]?.toLowerCase();

    const formatJid = (jid) => jid ? jid.replace(/@s\.whatsapp\.net|@g\.us/g, '') : 'Unknown';

    const getChatInfo = async (jid) => {
        if (!jid) return { name: 'Unknown Chat', isGroup: false };
        if (jid.includes('@g.us')) {
            try {
                const groupMetadata = await Matrix.groupMetadata(jid);
                return {
                    name: groupMetadata?.subject || 'Unknown Group',
                    isGroup: true
                };
            } catch {
                return { name: 'Unknown Group', isGroup: true };
            }
        }
        return { name: 'Private Chat', isGroup: false };
    };

    if (cmd === 'antidelete') {
        if (m.sender !== ownerJid) {
            await m.reply('🚫 *You are not authorized to use this command!*');
            return;
        }

        try {
            const mode = config.DELETE_PATH === "same" ? "Same Chat" : "Owner PM";
            const responses = {
                on: `🛡️ *ANTI-DELETE ENABLED* 🛡️\n\n🔹 Protection: *ACTIVE*\n🔹 Scope: *All Chats*\n🔹 Cache: *5 minutes*\n🔹 Mode: *${mode}*\n\n✅ Deleted messages will be recovered!`,
                off: `⚠️ *ANTI-DELETE DISABLED* ⚠️\n\n🔸 Protection: *OFF*\n🔸 Cache cleared\n🔸 Deleted messages will not be recovered.`,
                help: `⚙️ *ANTI-DELETE SETTINGS* ⚙️\n\n🔹 *${prefix}antidelete on* - Enable\n🔸 *${prefix}antidelete off* - Disable\n\nCurrent Status: ${antiDelete.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}\nCurrent Mode: ${mode}`
            };

            if (subCmd === 'on') {
                antiDelete.enabled = true;
                await m.reply(responses.on);
            } else if (subCmd === 'off') {
                antiDelete.enabled = false;
                await antiDelete.db.run(`DELETE FROM messages`);
                await m.reply(responses.off);
            } else {
                await m.reply(responses.help);
            }
            await m.React('✅');
            return;
        } catch (error) {
            console.error('AntiDelete Command Error:', error);
            await m.React('❌');
        }
    }

    if (!Matrix._antiDeleteRegistered) {
        Matrix._antiDeleteRegistered = true;

        Matrix.ev.on('messages.upsert', async ({ messages }) => {
            if (!antiDelete.enabled || !messages?.length) return;

            for (const msg of messages) {
                if (msg.key.fromMe || !msg.message || msg.key.remoteJid === 'status@broadcast') continue;

                try {
                    const content = msg.message.conversation ||
                        msg.message.extendedTextMessage?.text ||
                        msg.message.imageMessage?.caption ||
                        msg.message.videoMessage?.caption ||
                        msg.message.documentMessage?.caption;

                    let media, type, mimetype;

                    const mediaTypes = ['image', 'video', 'audio', 'sticker', 'document'];
                    for (const mediaType of mediaTypes) {
                        if (msg.message[`${mediaType}Message`]) {
                            const mediaMsg = msg.message[`${mediaType}Message`];
                            try {
                                const stream = await downloadContentFromMessage(mediaMsg, mediaType);
                                let buffer = Buffer.from([]);
                                for await (const chunk of stream) {
                                    buffer = Buffer.concat([buffer, chunk]);
                                }
                                media = buffer;
                                type = mediaType;
                                mimetype = mediaMsg.mimetype;
                                break;
                            } catch (e) {
                                console.error(`Error downloading ${mediaType} media:`, e);
                            }
                        }
                    }

                    // Voice message
                    if (msg.message.audioMessage?.ptt) {
                        try {
                            const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
                            let buffer = Buffer.from([]);
                            for await (const chunk of stream) {
                                buffer = Buffer.concat([buffer, chunk]);
                            }
                            media = buffer;
                            type = 'voice';
                            mimetype = msg.message.audioMessage.mimetype;
                        } catch (e) {
                            console.error('Error downloading voice message:', e);
                        }
                    }

                    if (content || media) {
                        await antiDelete.addMessage(msg.key.id, {
                            content,
                            media,
                            type,
                            mimetype,
                            sender: msg.key.participant || msg.key.remoteJid,
                            senderFormatted: `@${formatJid(msg.key.participant || msg.key.remoteJid)}`,
                            timestamp: msg.messageTimestamp * 1000,
                            chatJid: msg.key.remoteJid
                        });
                    }
                } catch (err) {
                    console.error('Error caching message:', err);
                }
            }
        });

        Matrix.ev.on('messages.update', async (updates) => {
            if (!antiDelete.enabled || !updates?.length) return;

            for (const update of updates) {
                if (update.update?.status !== 'revoked') continue;

                const deletedMsg = await antiDelete.getMessage(update.key.id);
                if (!deletedMsg) return;

                const chatInfo = await getChatInfo(deletedMsg.chatJid);
                const formattedTime = antiDelete.formatTime(deletedMsg.timestamp);
                const messageHeader = `🗑️ *ANTI DELETE SYSTEM* 🗑️\n\n📅 *Time:* ${formattedTime}\n👤 *Sender:* ${deletedMsg.senderFormatted}\n💬 *Chat:* ${chatInfo.name}\n\n📩 *Recovered Message:*`;

                const target = config.DELETE_PATH === "same" ? deletedMsg.chatJid : config.OWNER_NUMBER + '@s.whatsapp.net';

                try {
                    await Matrix.sendMessage(target, { text: messageHeader }, { quoted: null });

                    if (deletedMsg.media) {
                        await Matrix.sendMessage(target, {
                            [deletedMsg.type]: deletedMsg.media,
                            mimetype: deletedMsg.mimetype,
                            caption: deletedMsg.content || ''
                        }, { quoted: null });
                    } else if (deletedMsg.content) {
                        await Matrix.sendMessage(target, { text: deletedMsg.content }, { quoted: null });
                    }

                    await antiDelete.deleteMessage(update.key.id);
                } catch (error) {
                    console.error('Error forwarding deleted message:', error);
                }
            }
        });
    }
};

export default AntiDelete;
