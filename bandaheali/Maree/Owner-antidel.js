import pkg from '@whiskeysockets/baileys';
const { proto, downloadContentFromMessage } = pkg;
import config from '../config.cjs';
import { DeletedMessage, Settings } from '../data/database.js';

class AntiDeleteSystem {
  constructor() {
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanExpiredMessages(), this.cacheExpiry);
  }

  async isEnabled() {
    const settings = await Settings.findByPk(1);
    return settings?.enabled ?? config.ANTI_DELETE;
  }

  async getPath() {
    const settings = await Settings.findByPk(1);
    return settings?.path || config.ANTI_DELETE_PATH || 'inbox';
  }

  async addMessage(key, message) {
    try {
      // First try to update existing message
      const [affectedRows] = await DeletedMessage.update(message, {
        where: { id: key }
      });
      
      // If no rows were updated, insert new message
      if (affectedRows === 0) {
        await DeletedMessage.create({
          id: key,
          ...message,
          media: message.media ? Buffer.from(message.media) : null
        });
      }
    } catch (error) {
      console.error('Message save error:', error.message);
    }
  }

  async getMessage(key) {
    return await DeletedMessage.findByPk(key);
  }

  async deleteMessage(key) {
    await DeletedMessage.destroy({ where: { id: key } });
  }

  async cleanExpiredMessages() {
    const expiryTime = Date.now() - this.cacheExpiry;
    await DeletedMessage.destroy({ 
      where: { timestamp: { [Sequelize.Op.lt]: expiryTime } }
    });
  }

  formatTime(timestamp) {
    return new Date(timestamp).toLocaleString('en-PK', {
      timeZone: 'Asia/Karachi',
      hour12: true,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' PKT';
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

const AntiDelete = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
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

  const antiDelete = new AntiDeleteSystem();

  if (cmd === 'antidelete') {
    if (!isCreator) {
      await m.reply('╭━━〔 *PERMISSION DENIED* 〕━━┈⊷\n┃◈╭─────────────·๏\n┃◈┃• You are not authorized!\n┃◈╰─────────────·๏\n╰━━━━━━━━━━━━━━━━┈⊷');
      return;
    }

    try {
      const mode = await antiDelete.getPath();
      const modeName = mode === "same" ? "Same Chat" : 
                     mode === "inbox" ? "Bot Inbox" : "Owner PM";
      const isEnabled = await antiDelete.isEnabled();

      if (subCmd === 'on') {
        await Settings.update({ enabled: true }, { where: { id: 1 } });
        await m.reply(`╭━━〔 *ANTI-DELETE* 〕━━┈⊷\n┃◈╭─────────────·๏\n┃◈┃• Status: ✅ Enabled\n┃◈┃• Mode: ${modeName}\n┃◈╰─────────────·๏\n╰━━━━━━━━━━━━━━━━┈⊷`);
      } 
      else if (subCmd === 'off') {
        await Settings.update({ enabled: false }, { where: { id: 1 } });
        await antiDelete.cleanExpiredMessages();
        await m.reply(`╭━━〔 *ANTI-DELETE* 〕━━┈⊷\n┃◈╭─────────────·๏\n┃◈┃• Status: ❌ Disabled\n┃◈╰─────────────·๏\n╰━━━━━━━━━━━━━━━━┈⊷`);
      }
      else {
        await m.reply(`╭━━〔 *ANTI-DELETE* 〕━━┈⊷\n┃◈╭─────────────·๏\n┃◈┃• ${prefix}antidelete on/off\n┃◈┃• Status: ${isEnabled ? '✅' : '❌'}\n┃◈┃• Mode: ${modeName}\n┃◈╰─────────────·๏\n╰━━━━━━━━━━━━━━━━┈⊷`);
      }
      await m.React('✅');
    } catch (error) {
      console.error('Command error:', error);
      await m.React('❌');
    }
    return;
  }

  // Message handling
  Matrix.ev.on('messages.upsert', async ({ messages }) => {
    if (!await antiDelete.isEnabled() || !messages?.length) return;
    
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
              console.error(`Media download error:`, e);
            }
          }
        }
        
        if (msg.message.audioMessage?.ptt) {
          try {
            const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk]);
            }
            media = buffer;
            type = 'audio';
            mimetype = 'audio/ogg; codecs=opus';
          } catch (e) {
            console.error('Voice download error:', e);
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
        console.error('Message processing error:', error);
      }
    }
  });

  // Deletion handling
  Matrix.ev.on('messages.update', async (updates) => {
    if (!await antiDelete.isEnabled() || !updates?.length) return;

    for (const update of updates) {
      try {
        const { key, update: updateData } = update;
        const isDeleted = updateData?.messageStubType === proto.WebMessageInfo.StubType.REVOKE;
        
        if (!isDeleted || key.fromMe) continue;

        const cachedMsg = await antiDelete.getMessage(key.id);
        if (!cachedMsg) continue;

        await antiDelete.deleteMessage(key.id);
        
        const path = await antiDelete.getPath();
        let destination;
        if (path === "same") {
          destination = key.remoteJid;
        } else if (path === "inbox") {
          destination = Matrix.user.id;
        } else {
          destination = config.OWNER_NUMBER + '@s.whatsapp.net';
        }

        const chatInfo = await getChatInfo(cachedMsg.chatJid);
        const deletedBy = updateData?.participant ? 
          `@${formatJid(updateData.participant)}` : 
          (key.participant ? `@${formatJid(key.participant)}` : 'Unknown');

        const messageType = cachedMsg.type ? 
          cachedMsg.type.charAt(0).toUpperCase() + cachedMsg.type.slice(1) : 
          'Text';
        
        // Send alert first
        await Matrix.sendMessage(destination, {
          text: `╭━━〔 *DELETED ${messageType}* 〕━━┈⊷\n┃◈╭─────────────·๏\n┃◈┃• Sender: ${cachedMsg.senderFormatted}\n┃◈┃• Deleted By: ${deletedBy}\n┃◈┃• Chat: ${chatInfo.name}${chatInfo.isGroup ? ' (Group)' : ''}\n┃◈┃• Sent At: ${antiDelete.formatTime(cachedMsg.timestamp)}\n┃◈┃• Deleted At: ${antiDelete.formatTime(Date.now())}\n┃◈╰─────────────·๏\n╰━━━━━━━━━━━━━━━━┈⊷`
        });

        // Send media if exists
        if (cachedMsg.media) {
          await Matrix.sendMessage(destination, {
            [cachedMsg.type]: cachedMsg.media,
            mimetype: cachedMsg.mimetype,
            ...(cachedMsg.type === 'audio' && { ptt: true })
          });
        }
        
        // Send text content
        if (cachedMsg.content) {
          await Matrix.sendMessage(destination, {
            text: `💬 *Content:*\n${cachedMsg.content}`
          });
        }
      } catch (error) {
        console.error('Recovery error:', error);
      }
    }
  });
};

export default AntiDelete;
