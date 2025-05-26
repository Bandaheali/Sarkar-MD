import { fileTypeFromBuffer } from 'file-type';
import config from '../../config.js';

const postCommand = async (m, sock) => {
    const prefix = config.PREFIX;
    const isCmd = m.body.startsWith(prefix)
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    if (isCmd !== 'post') return;

    try {
        const caption = m.body.slice(prefix.length + 'post'.length).trim();

        // Select message to get media from
        const targetMsg = m.quoted || m;

        // Detect media type and download buffer
        const getMedia = async () => {
            try {
                const buffer = await sock.downloadMediaMessage(targetMsg, 'buffer');
                if (!buffer || buffer.length === 0) {
                    throw new Error('Empty media buffer');
                }
                return buffer;
            } catch (err) {
                console.error('Media download failed:', err);
                throw new Error('❌ Could not download media. Please make sure it is recent and valid.');
            }
        };

        let mediaType;
        if (targetMsg?.message?.imageMessage) {
            mediaType = 'image';
        } else if (targetMsg?.message?.videoMessage) {
            mediaType = 'video';
        } else if (targetMsg?.message?.audioMessage) {
            mediaType = 'audio';
        } else {
            await m.reply('❌ Please attach or reply to an image, video, or audio with *.post*');
            return;
        }

        const mediaBuffer = await getMedia();

        const fileInfo = await fileTypeFromBuffer(mediaBuffer);
        if (!fileInfo) {
            await m.reply('❌ Could not determine the file type. Please send a valid media file.');
            return;
        }

        // Prepare media message
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

        const statusOptions = {
            ephemeralExpiration: 86400,
            mediaUploadTimeoutMs: 60000
        };

        await sock.sendMessage('status@broadcast', mediaPayload, statusOptions);

        await m.reply('✅ Successfully posted to your status!');
        if (typeof m.react === 'function') await m.react('✅');

    } catch (error) {
        console.error('Post Command Error:', error);
        await m.reply(error.message || '❌ Something went wrong.');
        if (typeof m.react === 'function') await m.react('❌');
    }
};

export default postCommand;
