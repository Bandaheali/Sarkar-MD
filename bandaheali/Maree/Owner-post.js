import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import config from '../../config.js';

const postCommand = async (m, sock) => {
    const prefix = config.PREFIX;
    const isCmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    // Check if it's a reply with .post command
    if (!m.quoted || isCmd !== 'post') return;

    try {
        // Check if the quoted message has media
        if (!m.quoted.mimetype) {
            await m.reply('❌ Please reply to an image, video, or audio with *.post*');
            return;
        }

        // Get the media from the quoted message
        const mediaType = m.quoted.mimetype.split('/')[0];
        let mediaBuffer;
        let caption = m.body.slice(prefix.length + 'post'.length).trim();

        // Download the media
        if (m.quoted.message?.imageMessage) {
            mediaBuffer = await sock.downloadMediaMessage(m.quoted);
        } 
        else if (m.quoted.message?.videoMessage) {
            mediaBuffer = await sock.downloadMediaMessage(m.quoted);
        } 
        else if (m.quoted.message?.audioMessage) {
            mediaBuffer = await sock.downloadMediaMessage(m.quoted);
        } 
        else {
            await m.reply('❌ Unsupported media type. Only images, videos and audio are supported.');
            return;
        }

        // Determine file extension
        const fileInfo = await fileTypeFromBuffer(mediaBuffer);
        if (!fileInfo) {
            await m.reply('❌ Could not determine file type');
            return;
        }

        const ext = fileInfo.ext;
        const tempFilePath = `./temp/post_${Date.now()}.${ext}`;

        // Save to temporary file
        fs.writeFileSync(tempFilePath, mediaBuffer);

        // Upload to status
        await sock.sendMessage(
            'status@broadcast',
            mediaType === 'image' ? 
                { image: fs.readFileSync(tempFilePath), caption: caption || '' } :
            mediaType === 'video' ? 
                { video: fs.readFileSync(tempFilePath), caption: caption || '' } :
                { audio: fs.readFileSync(tempFilePath) },
            { ephemeralExpiration: 86400 } // 24 hours
        );

        // Clean up
        fs.unlinkSync(tempFilePath);

        await m.reply('✅ Successfully posted to your status!');
        await m.React('✅');

    } catch (error) {
        console.error('Post Command Error:', error);
        await m.reply('❌ Failed to post to status. Please try again later.');
        await m.React('❌');
    }
};

export default postCommand;
