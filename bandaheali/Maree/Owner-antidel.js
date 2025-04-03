import pkg from '@whiskeysockets/baileys';
const { proto, downloadMediaMessage } = pkg;
import config from '../../config.cjs';

// Global toggle for anti-delete
let antiDeleteEnabled = false;
const messageCache = new Map();

// Default delete path
config.DELETE_PATH = config.DELETE_PATH || "pm";

const AntiDelete = async (m, Matrix) => {
    const prefix = config.PREFIX;
    const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net'; // Owner JID
    const text = m.body.slice(prefix.length).trim().split(' ');
    const cmd = text[0]?.toLowerCase();
    const subCmd = text[1]?.toLowerCase();

    // Cache all messages (for content recovery)
    Matrix.ev.on('messages.upsert', async ({ messages }) => {
        if (!antiDeleteEnabled) return;
        
        for (const msg of messages) {
            if (msg.key.fromMe || !msg.message) continue;
            
            let content = msg.message.conversation || msg.message.extendedTextMessage?.text || null;
            let media = null;
            let type = null;
            
            if (msg.message.imageMessage) {
                media = await downloadMediaMessage(msg, 'buffer');
                type = 'image';
            } else if (msg.message.videoMessage) {
                media = await downloadMediaMessage(msg, 'buffer');
                type = 'video';
            } else if (msg.message.audioMessage) {
                media = await downloadMediaMessage(msg, 'buffer');
                type = 'audio';
            } else if (msg.message.stickerMessage) {
                media = await downloadMediaMessage(msg, 'buffer');
                type = 'sticker';
            }
            
            messageCache.set(msg.key.id, {
                content,
                media,
                type,
                mimetype: msg.message[type + 'Message']?.mimetype,
                sender: msg.key.participant || msg.key.remoteJid,
                timestamp: new Date().getTime(), // Save timestamp in milliseconds
                chatJid: msg.key.remoteJid
            });
        }
    });

    // Handle anti-delete commands
    if (cmd === 'antidelete') {
        try {
            if (subCmd === 'on') {
                antiDeleteEnabled = true;
                await m.reply(`╭━━━〔 *ANTI-DELETE* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *GLOBAL ACTIVATION*
┃▸└───────────···๏
╰────────────────┈⊷
Anti-delete protection is now *ACTIVE* in:
✦ All Groups
✦ Private Chats
✦ Every conversation

> *Powered By Sarkar-MD*`);
                await m.React('✅');
            } 
            else if (subCmd === 'off') {
                antiDeleteEnabled = false;
                messageCache.clear();
                await m.reply(`╭━━━〔 *ANTI-DELETE* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *GLOBAL DEACTIVATION*
┃▸└───────────···๏
╰────────────────┈⊷
Anti-delete protection is now *DISABLED* everywhere.

> *Powered By Sarkar-MD*`);
                await m.React('✅');
            }
            else {
                await m.reply(`╭━━━〔 *ANTI-DELETE* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *SYSTEM CONTROL*
┃▸└───────────···๏
╰────────────────┈⊷
*${prefix}antidelete on* - Activate everywhere
*${prefix}antidelete off* - Deactivate everywhere

Current Status: ${antiDeleteEnabled ? '✅ ACTIVE' : '❌ INACTIVE'}

> *Powered By Sarkar-MD*`);
                await m.React('ℹ️');
            }
            return;
        } catch (error) {
            console.error('AntiDelete Command Error:', error);
            await m.React('❌');
        }
    }

    // Handle message deletions globally when enabled
    Matrix.ev.on('messages.update', async (update) => {
        if (!antiDeleteEnabled) return;

        try {
            for (const item of update) {
                const { key } = item;
                if (key.fromMe) continue;

                const cachedMsg = messageCache.get(key.id);
                if (!cachedMsg) continue;

                let destination = config.DELETE_PATH === "same" ? key.remoteJid : ownerJid;
                
                if (cachedMsg.media && cachedMsg.type) {
                    await Matrix.sendMessage(destination, {
                        [cachedMsg.type]: cachedMsg.media,
                        mimetype: cachedMsg.mimetype,
                        caption: `*Deleted ${cachedMsg.type.charAt(0).toUpperCase() + cachedMsg.type.slice(1)} Recovered!*\n\n*Sender:* ${cachedMsg.sender}\n*Chat:* ${cachedMsg.chatJid}`
                    });
                } else if (cachedMsg.content) {
                    await Matrix.sendMessage(destination, {
                        text: `*Deleted Message Alert!*\n\n*Sender:* ${cachedMsg.sender}\n*Chat:* ${cachedMsg.chatJid}\n*Content:* \n${cachedMsg.content}`
                    });
                }
                
                // Remove the deleted message from cache
                messageCache.delete(key.id);
            }
        } catch (error) {
            console.error('Anti-Delete Handler Error:', error);
        }
    });

    // Cache Cleanup: Remove expired messages (1 minute expiration)
    setInterval(() => {
        const now = Date.now();
        messageCache.forEach((msg, key) => {
            if (now - msg.timestamp > 60000) {  // 1 minute expiration time
                messageCache.delete(key);
            }
        });
    }, 60000);
};

export default AntiDelete;
