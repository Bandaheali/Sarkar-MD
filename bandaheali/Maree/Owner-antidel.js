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

    // Format time in Asia/Karachi timezone
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
                on: `🛡️ *ANTI-DELETE ENABLED* 🛡️\n\n🔹 Protection: *ACTIVE*\n🔹 Scope: *All Chats*\n🔹 Cache: *5 minutes*\n🔹 Mode: *${config.DELETE_PATH === "same" ? "Same Chat" : "Owner PM"}*\n\n✅ Deleted messages will be recovered!\n\n*_POWERED BY SARKAR-MD_*`,
                off: `⚠️ *ANTI-DELETE DISABLED* ⚠️\n\n🔸 Protection: *OFF*\n🔸 Cache cleared\n🔸 Deleted messages will not be recovered.\n\n*_POWERED BY SARKAR-MD_*`,
                help: `⚙️ *ANTI-DELETE SETTINGS* ⚙️\n\n🔹 *${prefix}antidelete on* - Enable\n🔸 *${prefix}antidelete off* - Disable\n\nCurrent Status: ${antiDelete.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}\nCurrent Mode: ${config.DELETE_PATH === "same" ? "Same Chat" : "Owner PM"}\n\n*_POWERED BY SARKAR-MD_*`
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

    // Message caching - only cache messages that might be deleted (not from me)
    Matrix.ev.on('messages.upsert', async ({ messages }) => {
        if (!antiDelete.enabled) return;
        
        for (const msg of messages) {
            // Skip messages from me and protocol messages
            if (msg.key.fromMe || !msg.message || msg.key.remoteJid === 'status@broadcast') continue;
            
            try {
                let content, media, type, mimetype;
                
                // Extract message content
                if (msg.message.conversation) {
                    content = msg.message.conversation;
                } else if (msg.message.extendedTextMessage?.text) {
                    content = msg.message.extendedTextMessage.text;
                }
                
                // Handle all media types including voice messages
                const mediaTypes = ['image', 'video', 'audio', 'sticker', 'document'];
                for (const mediaType of mediaTypes) {
                    if (msg.message[`${mediaType}Message`]) {
                        media = await downloadMediaMessage(msg, 'buffer');
                        type = mediaType;
                        mimetype = msg.message[`${mediaType}Message`].mimetype;
                        break;
                    }
                }
                
                // Special handling for voice messages
                if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
                    type = 'voice';
                    media = await downloadMediaMessage(msg, 'buffer');
                    mimetype = msg.message.audioMessage.mimetype;
                }
                
                // Only cache messages that have content or media
                if (content || media) {
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
                }
            } catch (error) {
                console.error('Error caching message:', error);
            }
        }
    });

    // Deletion handler - properly detect deleted messages
    Matrix.ev.on('messages.update', async (update) => {
        if (!antiDelete.enabled) return;

        for (const item of update) {
            try {
                const { key, update } = item;
                
                // Skip if message wasn't cached
                if (!antiDelete.messageCache.has(key.id)) {
                    continue;
                }

                // Check if message was deleted (either by update or by checking the message status)
                const isDeleted = update?.messageStubType === 0 || 
                                update?.status === 'deleted' || 
                                (update?.message && update.message?.messageStubType === 0);

                if (!isDeleted) {
                    continue;
                }

                const cachedMsg = antiDelete.messageCache.get(key.id);
                antiDelete.messageCache.delete(key.id);
                
                // Determine destination based on DELETE_PATH
                const destination = config.DELETE_PATH === "same" ? key.remoteJid : ownerJid;
                const chatInfo = await getChatInfo(cachedMsg.chatJid);
                
                // Try to identify who deleted the message
                let deletedBy = 'Unknown';
                if (update?.participant) {
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
                               `🕒 *Sent At:* ${antiDelete.formatTime(cachedMsg.timestamp)}\n` +
                               `⏱️ *Deleted At:* ${antiDelete.formatTime(Date.now())}`;

                // Handle different media types with proper messaging
                if (cachedMsg.media) {
                    let messageOptions = {
                        [cachedMsg.type]: cachedMsg.media,
                        mimetype: cachedMsg.mimetype
                    };

                    // For voice messages, we need to send as audio with ptt: true
                    if (cachedMsg.type === 'voice') {
                        messageOptions = {
                            audio: cachedMsg.media,
                            mimetype: cachedMsg.mimetype,
                            ptt: true,
                            caption: baseInfo
                        };
                    } 
                    // For other media types, use their respective types
                    else {
                        messageOptions.caption = baseInfo;
                    }

                    await Matrix.sendMessage(destination, messageOptions);
                } 
                // For text messages
                else if (cachedMsg.content) {
                    await Matrix.sendMessage(destination, {
                        text: `${baseInfo}\n\n💬 *Content:* \n${cachedMsg.content}\n\n*_POWERED BY SARKAR-MD_*`
                    });
                }
            } catch (error) {
                console.error('Error handling deleted message:', error);
            }
        }
    });
};

export default AntiDelete;
