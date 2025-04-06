import pkg from '@whiskeysockets/baileys';
const { proto, downloadContentFromMessage } = pkg;
import config from '../../config.cjs';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'antidelete.json');

class AntiDeleteSystem {
    constructor() {
        this.enabled = config.ANTI_DELETE || false;
        this.cacheExpiry = 30 * 60 * 1000;
        this.messageCache = new Map();
        this.cleanupTimer = null;
        this.isSaving = false;
        this.saveQueue = [];
        this.loadDatabase();
        this.startCleanup();
        console.log('AntiDelete System Initialized');
    }

    async loadDatabase() {
        try {
            if (fs.existsSync(DB_FILE)) {
                const data = await fs.promises.readFile(DB_FILE, 'utf8');
                const parsed = JSON.parse(data);
                const now = Date.now();
                const validEntries = parsed.filter(([_, msg]) => 
                    now - msg.timestamp <= this.cacheExpiry
                );
                this.messageCache = new Map(validEntries);
                console.log(`Loaded ${validEntries.length} messages from database`);
                if (parsed.length !== validEntries.length) {
                    await this.saveDatabase();
                }
            }
        } catch (error) {
            console.error('Database load error:', error);
            this.messageCache = new Map();
        }
    }

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
            console.log(`Database saved with ${this.messageCache.size} messages`);
            
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

    async addMessage(key, message) {
        if (this.messageCache.size > 1000) {
            this.cleanExpiredMessages(true);
        }
        this.messageCache.set(key, message);
        console.log(`Message cached: ${key.id}`);
        await this.saveDatabase();
    }

    async deleteMessage(key) {
        if (this.messageCache.has(key)) {
            this.messageCache.delete(key);
            console.log(`Message deleted from cache: ${key.id}`);
            await this.saveDatabase();
        }
    }

    cleanExpiredMessages(force = false) {
        const now = Date.now();
        let changed = false;
        const threshold = this.cacheExpiry;
        
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
            console.log(`Cleaned ${changed} expired messages`);
            this.saveDatabase();
        }
    }

    startCleanup() {
        if (this.cleanupTimer) clearInterval(this.cleanupTimer);
        this.cleanupTimer = setInterval(
            () => this.cleanExpiredMessages(), 
            Math.min(this.cacheExpiry, 5 * 60 * 1000)
        );
        console.log('Cleanup timer started');
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

    // Enhanced message caching with better logging
    Matrix.ev.on('messages.upsert', async ({ messages, type }) => {
        if (!antiDelete.enabled || !messages?.length || type !== 'notify') {
            console.log('Message upsert skipped - not enabled or not notify type');
            return;
        }

        console.log(`Processing ${messages.length} new messages`);

        for (const msg of messages) {
            if (msg.key.fromMe || !msg.message || msg.key.remoteJid === 'status@broadcast') {
                console.log('Message skipped - fromMe or status broadcast');
                continue;
            }
            
            try {
                const content = msg.message.conversation || 
                              msg.message.extendedTextMessage?.text ||
                              msg.message.imageMessage?.caption ||
                              msg.message.videoMessage?.caption ||
                              msg.message.documentMessage?.caption;

                // Check if message has any content or media
                const hasMedia = msg.message.imageMessage || msg.message.videoMessage || 
                               msg.message.audioMessage || msg.message.stickerMessage || 
                               msg.message.documentMessage;

                if (!content && !hasMedia) {
                    console.log('Message skipped - no content or media');
                    continue;
                }

                let media, type, mimetype;
                
                // Handle voice notes first
                if (msg.message.audioMessage?.ptt) {
                    try {
                        console.log('Processing voice message');
                        const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) {
                            buffer = Buffer.concat([buffer, chunk]);
                        }
                        media = buffer;
                        type = 'ptt';
                        mimetype = msg.message.audioMessage.mimetype || 'audio/ogg; codecs=opus';
                        console.log('Voice message processed successfully');
                    } catch (e) {
                        console.error('Error downloading voice message:', e);
                    }
                }
                // Handle other media types
                else {
                    const mediaTypes = ['image', 'video', 'audio', 'sticker', 'document'];
                    for (const mediaType of mediaTypes) {
                        if (msg.message[`${mediaType}Message`]) {
                            try {
                                console.log(`Processing ${mediaType} message`);
                                const mediaMsg = msg.message[`${mediaType}Message`];
                                const stream = await downloadContentFromMessage(mediaMsg, mediaType);
                                let buffer = Buffer.from([]);
                                for await (const chunk of stream) {
                                    buffer = Buffer.concat([buffer, chunk]);
                                }
                                media = buffer;
                                type = mediaType;
                                mimetype = mediaMsg.mimetype;
                                console.log(`${mediaType} message processed successfully`);
                                break;
                            } catch (e) {
                                console.error(`Error downloading ${mediaType} media:`, e);
                            }
                        }
                    }
                }
                
                if (content || media) {
                    const messageData = {
                        content,
                        media,
                        type,
                        mimetype,
                        sender: msg.key.participant || msg.key.remoteJid,
                        senderFormatted: `@${formatJid(msg.key.participant || msg.key.remoteJid)}`,
                        timestamp: Date.now(),
                        chatJid: msg.key.remoteJid
                    };
                    console.log('Caching message:', {
                        id: msg.key.id,
                        type: type || 'text',
                        chat: msg.key.remoteJid
                    });
                    await antiDelete.addMessage(msg.key.id, messageData);
                }
            } catch (error) {
                console.error('Error caching message:', error);
            }
        }
    });

    // Enhanced deletion handling with better logging
    Matrix.ev.on('messages.update', async (updates) => {
        if (!antiDelete.enabled || !updates?.length) {
            console.log('Messages update skipped - not enabled or no updates');
            return;
        }

        console.log(`Processing ${updates.length} message updates`);

        for (const update of updates) {
            try {
                const { key, update: updateData } = update;
                
                // Check if message was deleted
                const isDeleted = updateData?.messageStubType === proto.WebMessageInfo.StubType.REVOKE || 
                                 updateData?.status === proto.WebMessageInfo.Status.DELETED;
                
                if (!isDeleted) {
                    console.log('Update skipped - not a deletion');
                    continue;
                }

                if (key.fromMe) {
                    console.log('Update skipped - fromMe');
                    continue;
                }

                if (!antiDelete.messageCache.has(key.id)) {
                    console.log(`No cached message found for deletion: ${key.id}`);
                    continue;
                }

                const cachedMsg = antiDelete.messageCache.get(key.id);
                console.log('Processing deleted message:', {
                    id: key.id,
                    type: cachedMsg.type || 'text',
                    chat: key.remoteJid
                });

                await antiDelete.deleteMessage(key.id);
                
                const destination = config.DELETE_PATH === "same" ? key.remoteJid : ownerJid;
                const chatInfo = await getChatInfo(cachedMsg.chatJid);
                
                const deletedBy = updateData?.participant ? 
                    `@${formatJid(updateData.participant)}` : 
                    (key.participant ? `@${formatJid(key.participant)}` : 'Unknown');

                let messageType = cachedMsg.type ? 
                    cachedMsg.type.charAt(0).toUpperCase() + cachedMsg.type.slice(1) : 
                    'Text';
                
                if (messageType === 'Ptt') messageType = 'Voice Note';
                
                const baseInfo = `🚨 *Deleted ${messageType} Recovered!*\n\n` +
                               `📌 *Sender:* ${cachedMsg.senderFormatted}\n` +
                               `✂️ *Deleted By:* ${deletedBy}\n` +
                               `📍 *Chat:* ${chatInfo.name}${chatInfo.isGroup ? ' (Group)' : ''}\n` +
                               `🕒 *Sent At:* ${antiDelete.formatTime(cachedMsg.timestamp)}\n` +
                               `⏱️ *Deleted At:* ${antiDelete.formatTime(Date.now())}`;

                try {
                    if (cachedMsg.media) {
                        let messageOptions = {};
                        
                        if (cachedMsg.type === 'ptt') {
                            messageOptions = {
                                audio: cachedMsg.media,
                                mimetype: cachedMsg.mimetype || 'audio/ogg; codecs=opus',
                                ptt: true,
                                caption: baseInfo
                            };
                        } else {
                            messageOptions = {
                                [cachedMsg.type]: cachedMsg.media,
                                mimetype: cachedMsg.mimetype,
                                caption: baseInfo
                            };
                        }

                        console.log('Sending recovered media message');
                        await Matrix.sendMessage(destination, messageOptions);
                    } 
                    else if (cachedMsg.content) {
                        console.log('Sending recovered text message');
                        await Matrix.sendMessage(destination, {
                            text: `${baseInfo}\n\n💬 *Content:* \n${cachedMsg.content}`
                        });
                    }
                    console.log('Message recovery successful');
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
