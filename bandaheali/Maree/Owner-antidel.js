import pkg from '@whiskeysockets/baileys';
const { proto, downloadContentFromMessage } = pkg;
import config from '../../config.cjs';
import fs from 'fs';
import path from 'path';

// Database file path with better handling
const DB_FILE = path.join(process.cwd(), 'antidelete.json');

class AntiDeleteSystem {
    constructor() {
        this.enabled = config.ANTI_DELETE;
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes (increased from 5)
        this.messageCache = new Map();
        this.cleanupTimer = null;
        this.isSaving = false;
        this.saveQueue = [];
        this.loadDatabase();
        this.startCleanup();
    }

    // Improved database loading with error handling
    async loadDatabase() {
        try {
            if (fs.existsSync(DB_FILE)) {
                const data = await fs.promises.readFile(DB_FILE, 'utf8');
                const parsed = JSON.parse(data);
                // Filter out expired messages immediately
                const now = Date.now();
                const validEntries = parsed.filter(([_, msg]) => 
                    now - msg.timestamp <= this.cacheExpiry
                );
                this.messageCache = new Map(validEntries);
                if (parsed.length !== validEntries.length) {
                    await this.saveDatabase();
                }
            }
        } catch (error) {
            console.error('Database load error:', error);
            this.messageCache = new Map();
        }
    }

    // Debounced database saving
    async saveDatabase() {
        if (this.isSaving) {
            return new Promise(resolve => {
                this.saveQueue.push(resolve);
            });
        }

        this.isSaving = true;
        try {
            const data = JSON.stringify(Array.from(this.messageCache.entries()));
            await fs.promises.writeFile(DB_FILE, data);
            
            // Process any queued saves
            while (this.saveQueue.length) {
                const resolve = this.saveQueue.shift();
                resolve();
            }
        } catch (error) {
            console.error('Database save error:', error);
        } finally {
            this.isSaving = false;
        }
    }

    // Optimized message addition
    async addMessage(key, message) {
        if (this.messageCache.size > 1000) { // Prevent memory overload
            this.cleanExpiredMessages(true); // Force cleanup
        }
        this.messageCache.set(key, message);
        await this.saveDatabase();
    }

    async deleteMessage(key) {
        if (this.messageCache.has(key)) {
            this.messageCache.delete(key);
            await this.saveDatabase();
        }
    }

    // More efficient cleanup
    cleanExpiredMessages(force = false) {
        const now = Date.now();
        let changed = false;
        const threshold = this.cacheExpiry;
        
        // Only check a portion of messages unless forced
        const checkCount = force ? this.messageCache.size : Math.min(100, this.messageCache.size);
        
        let checked = 0;
        for (const [key, msg] of this.messageCache.entries()) {
            if (now - msg.timestamp > threshold) {
                this.messageCache.delete(key);
                changed = true;
            }
            checked++;
            if (!force && checked >= checkCount) break;
        }
        
        if (changed) {
            this.saveDatabase();
        }
    }

    // Start/restart cleanup interval
    startCleanup() {
        if (this.cleanupTimer) clearInterval(this.cleanupTimer);
        this.cleanupTimer = setInterval(
            () => this.cleanExpiredMessages(), 
            Math.min(this.cacheExpiry, 5 * 60 * 1000) // Cleanup every 5 min max
        );
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
        if (this.cleanupTimer) clearInterval(this.cleanupTimer);
        await this.saveDatabase();
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

    // Command handler
    if (cmd === 'antidelete') {
        if (m.sender !== ownerJid) {
            await m.reply('🚫 *You are not authorized to use this command!*');
            return;
        }
        
        try {
            const mode = config.DELETE_PATH === "same" ? "Same Chat" : "Owner PM";
            const stats = `📊 Cache Stats: ${antiDelete.messageCache.size} messages stored`;
            const responses = {
                on: `🛡️ *ANTI-DELETE ENABLED* 🛡️\n\n🔹 Protection: *ACTIVE*\n🔹 Scope: *All Chats*\n🔹 Cache: *30 minutes*\n🔹 Mode: *${mode}*\n${stats}\n\n✅ Deleted messages will be recovered!`,
                off: `⚠️ *ANTI-DELETE DISABLED* ⚠️\n\n🔸 Protection: *OFF*\n🔸 Cache cleared\n🔸 Deleted messages will not be recovered.`,
                help: `⚙️ *ANTI-DELETE SETTINGS* ⚙️\n\n🔹 *${prefix}antidelete on* - Enable\n🔸 *${prefix}antidelete off* - Disable\n🔹 *${prefix}antidelete stats* - Show cache stats\n\nCurrent Status: ${antiDelete.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}\nCurrent Mode: ${mode}\n${stats}`
            };

            if (subCmd === 'on') {
                antiDelete.enabled = true;
                antiDelete.startCleanup();
                await m.reply(responses.on);
            } 
            else if (subCmd === 'off') {
                antiDelete.enabled = false;
                antiDelete.messageCache.clear();
                await antiDelete.saveDatabase();
                await m.reply(responses.off);
            }
            else if (subCmd === 'stats') {
                await m.reply(`📊 *Anti-Delete Cache Stats*\n\n• Stored Messages: ${antiDelete.messageCache.size}\n• Status: ${antiDelete.enabled ? '🟢 Active' : '🔴 Inactive'}\n• Cache Duration: 30 minutes`);
            }
            else {
                await m.reply(responses.help);
            }
            await m.React('✅');
            return;
        } catch (error) {
            console.error('AntiDelete Command Error:', error);
            await m.React('❌');
        }
    }

    // Message caching with rate limiting
    let lastCacheTime = 0;
    Matrix.ev.on('messages.upsert', async ({ messages }) => {
        if (!antiDelete.enabled || !messages?.length) return;
        
        // Simple rate limiting
        const now = Date.now();
        if (now - lastCacheTime < 100) return; // 10 messages/second max
        lastCacheTime = now;

        for (const msg of messages) {
            if (msg.key.fromMe || !msg.message || msg.key.remoteJid === 'status@broadcast') continue;
            
            try {
                const content = msg.message.conversation || 
                              msg.message.extendedTextMessage?.text ||
                              msg.message.imageMessage?.caption ||
                              msg.message.videoMessage?.caption ||
                              msg.message.documentMessage?.caption;

                // Skip if no content and not media
                if (!content && !msg.message.imageMessage && !msg.message.videoMessage && 
                    !msg.message.audioMessage && !msg.message.stickerMessage && !msg.message.documentMessage) {
                    continue;
                }

                let media, type, mimetype;
                
                // Handle voice messages (PTT) first
                if (msg.message.audioMessage?.ptt) {
                    try {
                        const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) {
                            buffer = Buffer.concat([buffer, chunk]);
                        }
                        media = buffer;
                        type = 'ptt';
                        mimetype = msg.message.audioMessage.mimetype || 'audio/ogg; codecs=opus';
                    } catch (e) {
                        console.error('Error downloading voice message:', e);
                    }
                } 
                // Handle other media types
                else {
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
                }
                
                if (content || media) {
                    await antiDelete.addMessage(msg.key.id, {
                        content,
                        media,
                        type,
                        mimetype,
                        sender: msg.key.participant || msg.key.remoteJid,
                        senderFormatted: `@${formatJid(msg.key.participant || msg.key.remoteJid)}`,
                        timestamp: Date.now(),
                        chatJid: msg.key.remoteJid
                    });
                }
            } catch (error) {
                console.error('Error caching message:', error);
            }
        }
    });

    // Deletion handler with better error handling
    Matrix.ev.on('messages.update', async (updates) => {
        if (!antiDelete.enabled || !updates?.length) return;

        for (const update of updates) {
            try {
                const { key, update: updateData } = update;
                
                // Check if message was actually deleted
                const isDeleted = updateData?.messageStubType === proto.WebMessageInfo.StubType.REVOKE || 
                                 updateData?.status === proto.WebMessageInfo.Status.DELETED;
                
                if (!isDeleted || key.fromMe || !antiDelete.messageCache.has(key.id)) {
                    continue;
                }

                const cachedMsg = antiDelete.messageCache.get(key.id);
                await antiDelete.deleteMessage(key.id);
                
                const destination = config.DELETE_PATH === "same" ? key.remoteJid : ownerJid;
                const chatInfo = await getChatInfo(cachedMsg.chatJid);
                
                const deletedBy = updateData?.participant ? 
                    `@${formatJid(updateData.participant)}` : 
                    (key.participant ? `@${formatJid(key.participant)}` : 'Unknown');

                const messageType = cachedMsg.type ? 
                    (cachedMsg.type === 'ptt' ? 'Voice Message' : 
                     cachedMsg.type.charAt(0).toUpperCase() + cachedMsg.type.slice(1)) : 
                    'Text';
                
                const baseInfo = `🚨 *Deleted ${messageType} Recovered!*\n\n` +
                               `📌 *Sender:* ${cachedMsg.senderFormatted}\n` +
                               `✂️ *Deleted By:* ${deletedBy}\n` +
                               `📍 *Chat:* ${chatInfo.name}${chatInfo.isGroup ? ' (Group)' : ''}\n` +
                               `🕒 *Sent At:* ${antiDelete.formatTime(cachedMsg.timestamp)}\n` +
                               `⏱️ *Deleted At:* ${antiDelete.formatTime(Date.now())}`;

                try {
                    if (cachedMsg.media) {
                        let messageOptions;
                        
                        if (cachedMsg.type === 'ptt') {
                            // Special handling for voice messages
                            messageOptions = {
                                audio: cachedMsg.media,
                                mimetype: cachedMsg.mimetype || 'audio/ogg; codecs=opus',
                                ptt: true,
                                contextInfo: {
                                    externalAdReply: {
                                        title: "Recovered Voice Message",
                                        body: baseInfo,
                                        thumbnail: null,
                                        mediaType: 1,
                                        mediaUrl: '',
                                        sourceUrl: '',
                                        showAdAttribution: false
                                    }
                                }
                            };
                        } else {
                            // Regular media handling
                            messageOptions = {
                                [cachedMsg.type]: cachedMsg.media,
                                mimetype: cachedMsg.mimetype,
                                caption: baseInfo
                            };
                        }

                        await Matrix.sendMessage(destination, messageOptions);
                    } 
                    else if (cachedMsg.content) {
                        await Matrix.sendMessage(destination, {
                            text: `${baseInfo}\n\n💬 *Content:* \n${cachedMsg.content}`
                        });
                    }
                } catch (sendError) {
                    console.error('Error sending recovered message:', sendError);
                }
            } catch (error) {
                console.error('Error handling deleted message:', error);
            }
        }
    });
};

export default AntiDelete;
