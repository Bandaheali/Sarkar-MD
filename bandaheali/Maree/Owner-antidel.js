import { proto } from '@whiskeysockets/baileys';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import config from '../../config.cjs';

class AntiDeleteSystem {
    constructor(matrix) {
        this.matrix = matrix;
        this.enabled = false;
        this.messageCache = new Map();
        this.MAX_CACHE_SIZE = 500;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.cleanupInterval = null;
        this.upsertHandler = null;
        this.updateHandler = null;
    }

    async enable() {
        if (this.enabled) return;
        
        this.enabled = true;
        this.setupListeners();
        this.startCleanupInterval();
        console.log('🛡️ Anti-Delete Activated');
    }

    async disable() {
        if (!this.enabled) return;
        
        this.enabled = false;
        this.clearResources();
        console.log('⚠️ Anti-Delete Deactivated');
    }

    setupListeners() {
        // Message caching handler
        this.upsertHandler = async ({ messages }) => {
            if (!this.enabled || !messages?.length) return;
            
            // Process messages in batches
            const batchSize = 10;
            for (let i = 0; i < messages.length; i += batchSize) {
                const batch = messages.slice(i, i + batchSize);
                await Promise.all(batch.map(async (msg) => {
                    try {
                        if (this.shouldSkipMessage(msg)) return;
                        
                        const cacheItem = await this.createCacheItem(msg);
                        if (cacheItem) {
                            this.addToCache(msg.key.id, cacheItem);
                        }
                    } catch (error) {
                        console.error('Caching error:', error);
                    }
                }));
            }
        };

        // Deletion handler
        this.updateHandler = async (updates) => {
            if (!this.enabled || !updates?.length) return;
            
            for (const update of updates) {
                try {
                    if (!this.isDeletedMessage(update)) continue;
                    
                    const cachedMsg = this.getMessageFromCache(update.key.id);
                    if (!cachedMsg) continue;
                    
                    await this.handleDeletedMessage(cachedMsg, update);
                } catch (error) {
                    console.error('Deletion handling error:', error);
                }
            }
        };

        this.matrix.ev.on('messages.upsert', this.upsertHandler);
        this.matrix.ev.on('messages.update', this.updateHandler);
    }

    shouldSkipMessage(msg) {
        // Skip if message doesn't meet criteria
        return !msg || 
               msg.key.fromMe || 
               !msg.message || 
               msg.key.remoteJid === 'status@broadcast' ||
               this.messageCache.size >= this.MAX_CACHE_SIZE;
    }

    async createCacheItem(msg) {
        try {
            const content = this.extractContent(msg);
            const media = await this.extractMedia(msg);
            
            if (!content && !media) return null;
            
            return {
                ...content,
                ...media,
                sender: msg.key.participant || msg.key.remoteJid,
                timestamp: Date.now(),
                chatJid: msg.key.remoteJid,
                messageId: msg.key.id
            };
        } catch (error) {
            console.error('Cache item creation failed:', error);
            return null;
        }
    }

    extractContent(msg) {
        try {
            const content = msg.message.conversation || 
                           msg.message.extendedTextMessage?.text ||
                           msg.message.imageMessage?.caption ||
                           msg.message.videoMessage?.caption ||
                           msg.message.documentMessage?.caption;
            
            return content ? { content } : {};
        } catch (error) {
            console.error('Content extraction failed:', error);
            return {};
        }
    }

    async extractMedia(msg) {
        const mediaTypes = ['image', 'video', 'audio', 'sticker', 'document'];
        
        for (const type of mediaTypes) {
            const mediaMsg = msg.message[`${type}Message`];
            if (!mediaMsg) continue;
            
            try {
                const buffer = await this.downloadMedia(mediaMsg, type);
                return {
                    media: buffer,
                    type: type === 'audio' && mediaMsg.ptt ? 'voice' : type,
                    mimetype: mediaMsg.mimetype,
                    fileName: mediaMsg.fileName || `media_${Date.now()}`
                };
            } catch (e) {
                console.error(`Media download failed (${type}):`, e);
                return null;
            }
        }
        return null;
    }

    async downloadMedia(mediaMsg, type) {
        try {
            const stream = await downloadContentFromMessage(mediaMsg, type);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            return buffer;
        } catch (error) {
            console.error('Media download failed:', error);
            throw error;
        }
    }

    addToCache(key, value) {
        // Implement LRU cache strategy
        if (this.messageCache.size >= this.MAX_CACHE_SIZE) {
            // Delete the oldest item
            const firstKey = this.messageCache.keys().next().value;
            this.messageCache.delete(firstKey);
        }
        this.messageCache.set(key, value);
    }

    startCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, msg] of this.messageCache.entries()) {
                if (now - msg.timestamp > this.cacheExpiry) {
                    this.messageCache.delete(key);
                }
            }
        }, this.cacheExpiry);
    }

    isDeletedMessage(update) {
        try {
            const { update: updateData } = update;
            return updateData?.messageStubType === proto.WebMessageInfo.StubType.REVOKE || 
                   updateData?.status === proto.WebMessageInfo.Status.DELETED;
        } catch (error) {
            console.error('Delete detection failed:', error);
            return false;
        }
    }

    getMessageFromCache(key) {
        try {
            const msg = this.messageCache.get(key);
            this.messageCache.delete(key); // Remove after retrieval
            return msg;
        } catch (error) {
            console.error('Cache retrieval failed:', error);
            return null;
        }
    }

    async handleDeletedMessage(cachedMsg, update) {
        try {
            const destination = config.DELETE_PATH === "same" 
                ? cachedMsg.chatJid 
                : config.OWNER_NUMBER + '@s.whatsapp.net';
            
            const chatInfo = await this.getChatInfo(cachedMsg.chatJid);
            const baseInfo = this.createNotification(cachedMsg, chatInfo, update);
            
            if (cachedMsg.media) {
                await this.sendMedia(destination, cachedMsg, baseInfo);
            } else {
                await this.sendText(destination, cachedMsg, baseInfo);
            }
        } catch (error) {
            console.error('Delete handling failed:', error);
        }
    }

    async getChatInfo(jid) {
        if (!jid?.includes('@g.us')) {
            return { name: 'Private Chat', isGroup: false };
        }
        
        try {
            const metadata = await this.matrix.groupMetadata(jid);
            return { 
                name: metadata?.subject || 'Unknown Group', 
                isGroup: true,
                participants: metadata?.participants || []
            };
        } catch {
            return { name: 'Unknown Group', isGroup: true };
        }
    }

    createNotification(cachedMsg, chatInfo, update) {
        const deletedBy = this.getDeletedBy(update);
        const messageType = this.getMessageType(cachedMsg);
        const timeFormat = this.formatTime(cachedMsg.timestamp);
        
        return `🚨 *Deleted ${messageType} Recovered!*\n\n` +
             `📌 *Sender:* @${this.formatJid(cachedMsg.sender)}\n` +
             `✂️ *Deleted By:* ${deletedBy}\n` +
             `📍 *Chat:* ${chatInfo.name}${chatInfo.isGroup ? ' (Group)' : ''}\n` +
             `🕒 *Sent At:* ${timeFormat}\n` +
             `⏱️ *Deleted At:* ${this.formatTime(Date.now())}`;
    }

    getDeletedBy(update) {
        try {
            const participant = update.update?.participant || update.key.participant;
            return participant ? `@${this.formatJid(participant)}` : 'Unknown';
        } catch (error) {
            console.error('Deleted by detection failed:', error);
            return 'Unknown';
        }
    }

    getMessageType(cachedMsg) {
        try {
            return cachedMsg.type 
                ? cachedMsg.type.charAt(0).toUpperCase() + cachedMsg.type.slice(1) 
                : 'Text';
        } catch (error) {
            console.error('Message type detection failed:', error);
            return 'Message';
        }
    }

    formatTime(timestamp) {
        try {
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
        } catch (error) {
            console.error('Time formatting failed:', error);
            return 'Unknown Time';
        }
    }

    formatJid(jid) {
        try {
            return jid?.replace(/@s\.whatsapp\.net|@g\.us/g, '') || 'Unknown';
        } catch (error) {
            console.error('JID formatting failed:', error);
            return 'Unknown';
        }
    }

    async sendMedia(destination, cachedMsg, caption) {
        try {
            await this.matrix.sendMessage(destination, {
                [cachedMsg.type]: cachedMsg.media,
                mimetype: cachedMsg.mimetype,
                caption: caption,
                fileName: cachedMsg.fileName,
                ...(cachedMsg.type === 'voice' && { ptt: true })
            });
        } catch (error) {
            console.error('Media send failed:', error);
            // Fallback to text if media fails
            await this.sendText(destination, cachedMsg, 
                `${caption}\n\n[Media failed to send - Type: ${cachedMsg.type}]`);
        }
    }

    async sendText(destination, cachedMsg, baseInfo) {
        try {
            await this.matrix.sendMessage(destination, {
                text: `${baseInfo}\n\n💬 *Content:* \n${cachedMsg.content || '[No text content]'}`
            });
        } catch (error) {
            console.error('Text send failed:', error);
        }
    }

    clearResources() {
        // Clear cache
        this.messageCache.clear();
        
        // Clear interval
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        // Remove listeners
        if (this.upsertHandler) {
            this.matrix.ev.off('messages.upsert', this.upsertHandler);
            this.upsertHandler = null;
        }
        if (this.updateHandler) {
            this.matrix.ev.off('messages.update', this.updateHandler);
            this.updateHandler = null;
        }
    }

    destroy() {
        this.disable();
    }
}

const AntiDelete = async (m, Matrix) => {
    if (!global.antiDelete) {
        global.antiDelete = new AntiDeleteSystem(Matrix);
    }

    const prefix = config.PREFIX;
    const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
    const text = m.body?.slice(prefix.length).trim().split(' ') || [];
    const cmd = text[0]?.toLowerCase();
    const subCmd = text[1]?.toLowerCase();

    if (cmd !== 'antidelete') return;

    // Enhanced authorization check
    if (m.sender !== ownerJid && !config.SUDO?.includes(m.sender.split('@')[0])) {
        await m.reply('🚫 *You are not authorized to use this command!*');
        return;
    }
    
    try {
        const mode = config.DELETE_PATH || 'same';
        
        if (!subCmd || subCmd === 'status') {
            const status = global.antiDelete.enabled ? '🟢 Active' : '🔴 Inactive';
            await m.reply(`🛡️ *Anti-Delete Status:* ${status}\n📤 *Forward Mode:* ${mode}`);
            return;
        }
        
        if (subCmd === 'on' || subCmd === 'enable') {
            await global.antiDelete.enable();
            await m.reply('✅ *Anti-Delete system activated!*');
        } 
        else if (subCmd === 'off' || subCmd === 'disable') {
            await global.antiDelete.disable();
            await m.reply('❌ *Anti-Delete system deactivated!*');
        }
        else {
            await m.reply(`Usage:\n${prefix}antidelete [on|off|status]`);
        }
    } catch (error) {
        console.error('AntiDelete command failed:', error);
        await m.reply('❌ *An error occurred while processing your request*');
    }
};

export default AntiDelete;
