import fs from 'fs';
import config from '../config.cjs';

const handleGreeting = async (m, gss) => {
  try {
    const textLower = m.body?.toLowerCase() || '';

    const triggerWords = [
      'send', 'statusdown', 'take', 'sent', 'giv', 'gib', 'upload',
      'send me', 'sent me', 'znt', 'snt', 'ayak', 'do', 'mee'
    ];

    if (!triggerWords.some(word => textLower.includes(word))) return;

    // Agar status reply hai toh yahan check hoga
    const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
                          m.message?.imageMessage || m.message?.videoMessage;

    if (!quotedMessage) return;

    let mediaType = null;
    let mediaCaption = '';
    let mediaMessage = null;

    if (quotedMessage.imageMessage) {
      mediaType = 'image';
      mediaCaption = quotedMessage.imageMessage.caption || '';
      mediaMessage = quotedMessage.imageMessage;
    } else if (quotedMessage.videoMessage) {
      mediaType = 'video';
      mediaCaption = quotedMessage.videoMessage.caption || '';
      mediaMessage = quotedMessage.videoMessage;
    }

    if (!mediaType || !mediaMessage) return;

    const mediaUrl = await gss.downloadAndSaveMediaMessage(mediaMessage);

    await gss.sendMessage(m.from, {
      [mediaType]: { url: mediaUrl },
      caption: mediaCaption,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 9999,
        isForwarded: true,
      },
    });

  } catch (error) {
    console.error('Error in handleGreeting:', error);
  }
};

export default handleGreeting;
