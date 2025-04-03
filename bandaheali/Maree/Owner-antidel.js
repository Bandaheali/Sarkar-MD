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

    // Optimized helper functions
    const formatJid = (jid) => jid ? jid.replace(/@s\.whatsapp\.net|@g\.us/g, '') : 'Unknown';
    
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
            const responses = {
                on: `🛡️ *ANTI-DELETE ENABLED* 🛡️\n\n🔹 Protection: *ACTIVE*\n🔹 Scope: *All Chats*\n🔹 Cache: *5 minutes*\n🔹 Mode: *${mode}*\n\n✅ Deleted messages will be recovered!`,
                off: `⚠️ *ANTI-DELETE DISABLED* ⚠️\n\n🔸 Protection: *OFF*\n🔸 Cache cleared\n🔸 Deleted messages will not be recovered.`,
                help: `⚙️ *ANTI-DELETE SETTINGS* ⚙️\n\n🔹 *${prefix}antidelete on* - Enable\n🔸 *${prefix}antidelete off* - Disable\n\nCurrent Status: ${antiDelete.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}\nCurrent Mode: ${mode}`
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

    // Optimized message caching
    Matrix.ev.on('messages.upsert', async ({ messages }) => {
        if (!antiDelete.enabled || !messages?.length) return;
        
        for (const msg of messages) {
            // Skip if: from me, no message, status broadcast, or protocol message
            if (msg.key.fromMe || !msg.message || msg.key.remoteJid === 'status@broadcast' || 
                msg.message.protocolMessage) continue;
            
            try {
                const content = msg.message.conversation || 
                              msg.message.extendedTextMessage?.text;
                
                // Skip if empty message (no content and no media)
                if (!content && !msg.message.imageMessage && !msg.message.videoMessage && 
                    !msg.message.audioMessage && !msg.message.stickerMessage && 
                    !msg.message.documentMessage) continue;

                let media, type, mimetype;
                
                // Handle media types more efficiently
                const mediaType = ['image', 'video', 'audio', 'sticker', 'document'].find(
                    t => msg.message[`${t}Message`]
                );
                
                if (mediaType) {
                    media = await downloadMediaMessage(msg, 'buffer');
                    type = mediaType;
                    mimetype = msg.message[`${mediaType}Message`].mimetype;
                }
                
                // Special handling for voice messages
                if (msg.message.audioMessage?.ptt) {
                    type = 'voice';
                    media = media || await downloadMediaMessage(msg, 'buffer');
                    mimetype = msg.message.audioMessage.mimetype;
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

    // Optimized deletion handler
    Matrix.ev.on('messages.update', async (update) => {
        if (!antiDelete.enabled || !update?.length) return;

        for (const item of update) {
            try {
                const { key, update: updateData } = item;
                
                // Skip if: from me, not in cache, or not a deletion
                if (key.fromMe || !antiDelete.messageCache.has(key.id) || 
                    !(updateData?.messageStubType === proto.MessageStubType.REVOKE || 
                      updateData?.status === proto.WebMessageInfo.Status.DELETED)) {
                    continue;
                }

                const cachedMsg = antiDelete.messageCache.get(key.id);
                antiDelete.messageCache.delete(key.id);
                
                const destination = config.DELETE_PATH === "same" ? key.remoteJid : ownerJid;
                const chatInfo = await getChatInfo(cachedMsg.chatJid);
                
                const deletedBy = updateData?.participant ? 
                    `@${formatJid(updateData.participant)}` : 
                    (key.participant ? `@${formatJid(key.participant)}` : 'Unknown');

                const messageType = cachedMsg.type ? 
                    cachedMsg.type.charAt(0).toUpperCase() + cachedMsg.type.slice(1) : 
                    'Message';
                
                const baseInfo = `🚨 *Deleted ${messageType} Recovered!*\n\n` +
                               `📌 *Sender:* ${cachedMsg.senderFormatted}\n` +
                               `✂️ *Deleted By:* ${deletedBy}\n` +
                               `📍 *Chat:* ${chatInfo.name}${chatInfo.isGroup ? ' (Group)' : ''}\n` +
                               `🕒 *Sent At:* ${antiDelete.formatTime(cachedMsg.timestamp)}\n` +
                               `⏱️ *Deleted At:* ${antiDelete.formatTime(Date.now())}`;

                if (cachedMsg.media) {
                    const messageOptions = cachedMsg.type === 'voice' ? {
                        audio: cachedMsg.media,
                        mimetype: cachedMsg.mimetype,
                        ptt: true,
                        caption: baseInfo
                    } : {
                        [cachedMsg.type]: cachedMsg.media,
                        mimetype: cachedMsg.mimetype,
                        caption: baseInfo
                    };

                    await Matrix.sendMessage(destination, messageOptions);
                } 
                else if (cachedMsg.content) {
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
