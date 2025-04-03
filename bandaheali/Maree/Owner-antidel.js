import pkg from '@whiskeysockets/baileys';
const { proto, downloadMediaMessage } = pkg;
import config from '../../config.cjs';

class AntiDeleteSystem {
    constructor() {
        this.enabled = false;
        this.messageCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache expiry
        this.maxCacheSize = 500; // Limit to 500 messages
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
        // Ensure cache does not exceed max size
        while (this.messageCache.size > this.maxCacheSize) {
            const firstKey = this.messageCache.keys().next().value;
            this.messageCache.delete(firstKey);
        }
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleString('en-PK', {
            timeZone: 'Asia/Karachi',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }) + ' (PKT)';
    }
}

const antiDelete = new AntiDeleteSystem();

const AntiDelete = async (m, Matrix) => {
    if (!m || !m.body) return;

    const prefix = config.PREFIX;
    const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
    const [cmd, subCmd] = m.body.slice(prefix.length).trim().split(' ');

    if (cmd === 'antidelete') {
        if (m.sender !== ownerJid) return await m.reply('🚫 *You are not authorized to use this command!*');

        if (subCmd === 'on') {
            antiDelete.enabled = true;
            return await m.reply('🛡️ *ANTI-DELETE ENABLED*');
        } else if (subCmd === 'off') {
            antiDelete.enabled = false;
            antiDelete.messageCache.clear();
            return await m.reply('⚠️ *ANTI-DELETE DISABLED*');
        } else {
            return await m.reply(`⚙️ *ANTI-DELETE SETTINGS*\n\n🔹 *${prefix}antidelete on* - Enable\n🔸 *${prefix}antidelete off* - Disable`);
        }
    }
};

Matrix.ev.on('messages.upsert', async ({ messages }) => {
    if (!antiDelete.enabled) return;
    
    for (const msg of messages) {
        if (msg.key.fromMe || !msg.message) continue;

        try {
            let content = msg.message.conversation || msg.message.extendedTextMessage?.text;
            let media, type, mimetype;

            for (const mediaType of ['image', 'video', 'audio', 'sticker', 'document']) {
                if (msg.message[`${mediaType}Message`]) {
                    media = await downloadMediaMessage(msg, 'buffer');
                    type = mediaType;
                    mimetype = msg.message[`${mediaType}Message`].mimetype;
                    break;
                }
            }

            if (content || media) {
                antiDelete.messageCache.set(msg.key.id, {
                    content, media, type, mimetype,
                    sender: msg.key.participant || msg.key.remoteJid,
                    timestamp: Date.now(),
                    chatJid: msg.key.remoteJid
                });
            }
        } catch (error) {
            console.error('Error caching message:', error);
        }
    }
});

Matrix.ev.on('messages.update', async (updates) => {
    if (!antiDelete.enabled) return;

    for (const update of updates) {
        if (!antiDelete.messageCache.has(update.key.id)) continue;

        const cachedMsg = antiDelete.messageCache.get(update.key.id);
        antiDelete.messageCache.delete(update.key.id);

        const destination = config.DELETE_PATH === "same" ? update.key.remoteJid : ownerJid;
        const deletedBy = update.participant ? `@${update.participant.split('@')[0]}` : 'Unknown';
        const messageType = cachedMsg.type ? cachedMsg.type.charAt(0).toUpperCase() + cachedMsg.type.slice(1) : 'Message';
        const baseInfo = `🚨 *Deleted ${messageType} Recovered!*\n\n📌 *Sender:* @${cachedMsg.sender.split('@')[0]}\n✂️ *Deleted By:* ${deletedBy}\n📍 *Chat:* ${cachedMsg.chatJid}\n🕒 *Sent At:* ${antiDelete.formatTime(cachedMsg.timestamp)}`;

        try {
            if (cachedMsg.media) {
                await Matrix.sendMessage(destination, { [cachedMsg.type]: cachedMsg.media, mimetype: cachedMsg.mimetype, caption: baseInfo });
            } else if (cachedMsg.content) {
                await Matrix.sendMessage(destination, { text: `${baseInfo}\n\n💬 *Content:*\n${cachedMsg.content}` });
            }
        } catch (error) {
            console.error('Error handling deleted message:', error);
        }
    }
});

export default AntiDelete;
