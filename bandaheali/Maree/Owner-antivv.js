import pkg from '@whiskeysockets/baileys';
const { downloadMediaMessage } = pkg;
import config from '../../config.js';

const viewOnce = async (m, sock) => {
  const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
  const prefix = config.PREFIX;

  const secretKeywords = ['🫡', 'lush', 'nice'];

  const isOwner = m.sender === ownerNumber;
  const isBot = m.sender === botNumber;
  
  if (secretKeywords.includes(m.body.toLowerCase()) && !isOwner) return;

  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : secretKeywords.includes(m.body.toLowerCase()) && isOwner
    ? 'vv2'
    : '';

  if (!['vv', 'vv2', 'vv3'].includes(cmd)) return;
  if (!m.quoted) return m.reply('*Reply to a View Once message!*');

  let msg = m.quoted.message;
  if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;
  else if (msg.viewOnceMessage) msg = msg.viewOnceMessage.message;

  if (!msg) return m.reply('*This is not a View Once message!*');


  if (['vv2', 'vv3'].includes(cmd) && !isOwner && !isBot) {
    return m.reply('*Only the Owner or Bot can use this command!*');
  }
  if (cmd === 'vv' && !isOwner && !isBot) {
    return m.reply('*Only the Owner or Bot can use this command to send media!*');
  }

  try {
    const messageType = Object.keys(msg)[0];
    let buffer;

    if (messageType === 'audioMessage') {
      buffer = await downloadMediaMessage(m.quoted, 'buffer', {}, { type: 'audio' });
    } else {
      buffer = await downloadMediaMessage(m.quoted, 'buffer');
    }

    if (!buffer) return m.reply('*Failed to retrieve media!*');

    let mimetype = msg.audioMessage?.mimetype || 'audio/ogg';
    let caption = `> *SARKAR-MD VIEWONCE UNLOCKED*`;

    // 📩 Define recipient
    let recipient =
      cmd === 'vv2'
        ? ownerNumber 
        : cmd === 'vv3'
        ? ownerNumber 
        : m.from; 
    if (messageType === 'imageMessage') {
      await sock.sendMessage(recipient, { image: buffer, caption });
    } else if (messageType === 'videoMessage') {
      await sock.sendMessage(recipient, { video: buffer, caption, mimetype: 'video/mp4' });
    } else if (messageType === 'audioMessage') {
      await sock.sendMessage(recipient, { audio: buffer, mimetype, ptt: true });
    } else {
      return m.reply('*Unsupported media type!*');
    }


    if (!(cmd === 'vv2' && isOwner)) {
      await sock.sendMessage(m.from, {
        text: `✅ *View Once Media Unlocked!*`,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315182578784@newsletter',
            newsletterName: 'Sarkar-MD',
            serverMessageId: -1,
          },
          forwardingScore: 999,
          externalAdReply: {
            title: '✨ Sarkar-MD ✨',
            body: 'View Once Media Unlocker',
            thumbnailUrl:
              'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
            sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD',
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      });

      await m.React('✅');
    }
  } catch (error) {
    console.error(error);
    await m.reply('*Failed to process View Once message!*');
  }
};

export default viewOnce;
