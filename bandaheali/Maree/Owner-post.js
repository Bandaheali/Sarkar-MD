import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import config from '../../config.js';

const postCommand = async (m, sock) => {
    const prefix = config.PREFIX;
    const isCmd = m.body.startsWith(prefix)
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    if (isCmd !== 'post') return;

    try {
        const quotedMsg = m.quoted?.message;
        let mediaBuffer;
        let mediaType;
        let caption = m.body.slice(prefix.length + 'post'.length).trim();

        const downloadMedia = async (msg) => {
            try {
                const buffer = await sock.downloadMediaMessage(msg);
                if (!buffer || buffer.length === 0) {
                    throw new Error('Empty media buffer');
                }
                return buffer;
            } catch (error) {
                console.error('Download failed:', error);
                throw new Error('❌ Could not download media');
            }
        };

        if (!m.quoted) {
            if (m.message?.imageMessage) {
                mediaBuffer = await downloadMedia(m);
                mediaType = 'image';
            } else if (m.message?.videoMessage) {
                mediaBuffer = await downloadMedia(m);
                mediaType = 'video';
            } else if (m.message?.audioMessage) {
                mediaBuffer = await downloadMedia(m);
                mediaType = 'audio';
            } else {
                await m.reply('❌ Please attach media or reply to media with *.post*');
                return;
            }
        } else {
            if (quotedMsg?.imageMessage) {
                mediaBuffer = await downloadMedia(m.quoted);
                mediaType = 'image';
            } else if (quotedMsg?.videoMessage) {
                mediaBuffer = await downloadMedia(m.quoted);
                mediaType = 'video';
            } else if (quotedMsg?.audioMessage) {
                mediaBuffer = await downloadMedia(m.quoted);
                mediaType = 'audio';
            } else {
                await m.reply('❌ The replied message has no media');
                return;
            }
        }

        if (!mediaBuffer || mediaBuffer.length === 0) {
            throw new Error('❌ Received empty media buffer');
        }

        const fileInfo = await fileTypeFromBuffer(mediaBuffer);
        if (!fileInfo) {
            await m.reply('❌ Could not determine the file type. Please send a valid media file.');
            return;
        }

        const statusOptions = {
            ephemeralExpiration: 86400,
            mediaUploadTimeoutMs: 60000
        };

        let mediaPayload;
        switch (mediaType) {
            case 'image':
                mediaPayload = {
                    image: mediaBuffer,
                    caption: caption || '',
                    mimetype: fileInfo.mime
                };
                break;
            case 'video':
                mediaPayload = {
                    video: mediaBuffer,
                    caption: caption || '',
                    mimetype: fileInfo.mime
                };
                break;
            case 'audio':
                mediaPayload = {
                    audio: mediaBuffer,
                    mimetype: fileInfo.mime,
                    ptt: true
                };
                break;
        }

        await sock.sendMessage('status@broadcast', mediaPayload, statusOptions);

        await m.reply('✅ Successfully posted to your status!');
        // Optional: Only react if `m.react` exists
        if (typeof m.react === 'function') await m.react('✅');

    } catch (error) {
        console.error('Post Command Error:', error);
        await m.reply(error.message || '❌ Something went wrong');
        if (typeof m.react === 'function') await m.react('❌');
    }
};

export default postCommand;
