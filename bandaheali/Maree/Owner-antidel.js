import pkg from '@whiskeysockets/baileys';
const { proto } = pkg;
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
    Matrix.ev.on('messages.upsert', ({ messages }) => {
        if (!antiDeleteEnabled) return;
        
        messages.forEach(msg => {
            if (msg.key.fromMe || !msg.message) return;
            
            let content = msg.message.conversation || msg.message.extendedTextMessage?.text || null;
            let media = null;
            
            if (msg.message.imageMessage) {
                media = msg.message.imageMessage;
                content = '[Image]';
            } else if (msg.message.videoMessage) {
                media = msg.message.videoMessage;
                content = '[Video]';
            } else if (msg.message.audioMessage) {
                media = msg.message.audioMessage;
                content = '[Audio]';
            } else if (msg.message.stickerMessage) {
                media = msg.message.stickerMessage;
                content = '[Sticker]';
            }
            
            messageCache.set(msg.key.id, {
                content,
                media,
                sender: msg.key.participant || msg.key.remoteJid,
                timestamp: new Date().getTime(), // Save timestamp in milliseconds
                chatJid: msg.key.remoteJid
            });
        });
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
                
                if (cachedMsg.media) {
                    await Matrix.sendMessage(destination, {
                        document: cachedMsg.media,
                        mimetype: cachedMsg.media.mimetype,
                        caption: `*Deleted Media Recovered!*\n\n*Sender:* ${cachedMsg.sender}\n*Chat:* ${cachedMsg.chatJid}`
                    });
                } else {
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
