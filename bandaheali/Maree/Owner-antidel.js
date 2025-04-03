import pkg from '@whiskeysockets/baileys';
const { proto, downloadMediaMessage } = pkg;
import config from '../../config.cjs';

class AntiDeleteSystem {
    constructor() {
        this.enabled = false;
        this.messageCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache expiry
        this.initCleanupInterval();
    }

    initCleanupInterval() {
        setInterval(() => this.cleanExpiredMessages(), this.cacheExpiry);
    }

    cleanExpiredMessages() {
        const now = Date.now();
        for (const [key, msg] of this.messageCache.entries()) {
            if (now - msg.timestamp > this.cacheExpiry) {
                this.messageCache.delete(key);
            }
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

    // Helper functions
    const formatJid = (jid) => {
        if (!jid) return 'Unknown';
        return jid.replace(/@s\.whatsapp\.net|@g\.us/g, '');
    };
    
    const getChatInfo = async (jid) => {
        if (!jid) return { name: 'Unknown Chat', isGroup: false };
        
        if (jid.includes('@g.us')) {
            try {
                const groupMetadata = await Matrix.groupMetadata(jid);
                return {
                    name: groupMetadata?.subject || 'Unknown Group',
                    isGroup: true,
                    participants: groupMetadata?.participants || []
                };
            } catch {
                return { name: 'Unknown Group', isGroup: true, participants: [] };
            }
        }
        return { name: 'Private Chat', isGroup: false, participants: [] };
    };

    // Command handler
    if (cmd === 'antidelete') {
        if (m.sender !== ownerJid) {
            await m.reply('🚫 *You are not authorized to use this command!*');
            return;
        }
        
        try {
            const responses = {
                on: `🛡️ *ANTI-DELETE ENABLED* 🛡️\n\n🔹 Protection: *ACTIVE*\n🔹 Scope: *All Chats*\n🔹 Cache: *5 minutes*\n🔹 Mode: *${config.DELETE_PATH === "same" ? "Same Chat" : "Owner PM"}*\n\n✅ Deleted messages will be recovered!`,
                off: `⚠️ *ANTI-DELETE DISABLED* ⚠️\n\n🔸 Protection: *OFF*\n🔸 Cache cleared\n🔸 Deleted messages will not be recovered.`,
                help: `⚙️ *ANTI-DELETE SETTINGS* ⚙️\n\n🔹 *${prefix}antidelete on* - Enable\n🔸 *${prefix}antidelete off* - Disable\n\nCurrent Status: ${antiDelete.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}\nCurrent Mode: ${config.DELETE_PATH === "same" ? "Same Chat" : "Owner PM"}`
            };

            if (subCmd === 'on') {
                antiDelete.enabled = true;
                await m.reply(responses.on);
            } 
            else if (subCmd === 'off') {
                antiDelete.enabled = false;
                antiDelete.messageCache.clear();
                await m.reply(responses.off);
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

    // Message caching
    Matrix.ev.on('messages.upsert', async ({ messages }) => {
        if (!antiDelete.enabled) return;
        
        for (const msg of messages) {
            if (msg.key.fromMe || !msg.message) continue;
            
            try {
                let content, media, type, mimetype;
                
                // Extract message content
                if (msg.message.conversation) {
                    content = msg.message.conversation;
                } else if (msg.message.extendedTextMessage?.text) {
                    content = msg.message.extendedTextMessage.text;
                }
                
                // Handle media messages
                const mediaTypes = ['image', 'video', 'audio', 'sticker', 'document'];
                for (const mediaType of mediaTypes) {
                    if (msg.message[`${mediaType}Message`]) {
                        media = await downloadMediaMessage(msg, 'buffer');
                        type = mediaType;
                        mimetype = msg.message[`${mediaType}Message`].mimetype;
                        break;
                    }
                }
                
                // Cache the message
                antiDelete.messageCache.set(msg.key.id, {
                    content,
                    media,
                    type,
                    mimetype,
                    sender: msg.key.participant || msg.key.remoteJid,
                    senderFormatted: `@${formatJid(msg.key.participant || msg.key.remoteJid)}`,
                    timestamp: Date.now(),
                    chatJid: msg.key.remoteJid,
                    originalMessage: msg
                });
            } catch (error) {
                console.error('Error caching message:', error);
            }
        }
    });

    // Deletion handler
    Matrix.ev.on('messages.update', async (update) => {
        if (!antiDelete.enabled) return;

        for (const item of update) {
            try {
                const { key, update } = item;
                if (key.fromMe || !antiDelete.messageCache.has(key.id)) continue;

                const cachedMsg = antiDelete.messageCache.get(key.id);
                antiDelete.messageCache.delete(key.id);
                
                // Determine destination based on DELETE_PATH
                const destination = config.DELETE_PATH === "same" ? key.remoteJid : ownerJid;
                const chatInfo = await getChatInfo(cachedMsg.chatJid);
                
                // Try to identify who deleted the message
                let deletedBy = 'Unknown';
                if (update && update.participant) {
                    deletedBy = `@${formatJid(update.participant)}`;
                } else if (key.participant) {
                    deletedBy = `@${formatJid(key.participant)}`;
                }

                // Prepare message info
                const messageType = cachedMsg.type ? 
                    cachedMsg.type.charAt(0).toUpperCase() + cachedMsg.type.slice(1) : 
                    'Message';
                
                const baseInfo = `🚨 *Deleted ${messageType} Recovered!*\n\n` +
                               `📌 *Sender:* ${cachedMsg.senderFormatted}\n` +
                               `✂️ *Deleted By:* ${deletedBy}\n` +
                               `📍 *Chat:* ${chatInfo.name}${chatInfo.isGroup ? ' (Group)' : ''}\n` +
                               `🕒 *Time:* ${new Date(cachedMsg.timestamp).toLocaleString()}`;

                if (cachedMsg.media && cachedMsg.type) {
                    await Matrix.sendMessage(destination, {
                        [cachedMsg.type]: cachedMsg.media,
                        mimetype: cachedMsg.mimetype,
                        caption: baseInfo
                    });
                } else if (cachedMsg.content) {
                    await Matrix.sendMessage(destination, {
                        text: `${baseInfo}\n\n💬 *Content:* \n${cachedMsg.content}`
                    });
                }
            } catch (error) {
                console.error('Error handling deleted message:', error);
            }
        }
    });
};

export default AntiDelete;
