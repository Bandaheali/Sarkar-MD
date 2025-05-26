import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import config from '../../config.js';

const postCommand = async (m, sock) => {
    const prefix = config.PREFIX;
    
    // Check if it's the post command (either direct or in reply)
    const isCmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() 
        : '';
    if (isCmd !== 'post') return;

    try {
        // Get the quoted message (if any)
        const quotedMsg = m.quoted?.message;
        
        // Check for media in different message types
        let mediaBuffer;
        let mediaType;
        let caption = m.body.slice(prefix.length + 'post'.length).trim();

        // Case 1: Direct media message (not reply)
        if (!m.quoted && (m.message?.imageMessage || m.message?.videoMessage || m.message?.audioMessage)) {
            if (m.message.imageMessage) {
                mediaBuffer = await sock.downloadMediaMessage(m);
                mediaType = 'image';
            } 
            else if (m.message.videoMessage) {
                mediaBuffer = await sock.downloadMediaMessage(m);
                mediaType = 'video';
            } 
            else if (m.message.audioMessage) {
                mediaBuffer = await sock.downloadMediaMessage(m);
                mediaType = 'audio';
            }
        }
        // Case 2: Quoted media message (reply)
        else if (m.quoted && (quotedMsg?.imageMessage || quotedMsg?.videoMessage || quotedMsg?.audioMessage)) {
            if (quotedMsg.imageMessage) {
                mediaBuffer = await sock.downloadMediaMessage(m.quoted);
                mediaType = 'image';
            } 
            else if (quotedMsg.videoMessage) {
                mediaBuffer = await sock.downloadMediaMessage(m.quoted);
                mediaType = 'video';
            } 
            else if (quotedMsg.audioMessage) {
                mediaBuffer = await sock.downloadMediaMessage(m.quoted);
                mediaType = 'audio';
            }
        } 
        else {
            await m.reply('❌ Please send or reply to an image, video, or audio with *.post*');
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
        const statusOptions = {
            ephemeralExpiration: 86400, // 24 hours
            mediaUploadTimeoutMs: 60000 // 1 minute timeout
        };

        if (mediaType === 'image') {
            await sock.sendMessage(
                'status@broadcast',
                { 
                    image: fs.readFileSync(tempFilePath), 
                    caption: caption || '',
                    mimetype: fileInfo.mime
                },
                statusOptions
            );
        } 
        else if (mediaType === 'video') {
            await sock.sendMessage(
                'status@broadcast',
                { 
                    video: fs.readFileSync(tempFilePath), 
                    caption: caption || '',
                    mimetype: fileInfo.mime
                },
                statusOptions
            );
        } 
        else if (mediaType === 'audio') {
            await sock.sendMessage(
                'status@broadcast',
                { 
                    audio: fs.readFileSync(tempFilePath),
                    mimetype: fileInfo.mime,
                    ptt: true // For voice note style
                },
                statusOptions
            );
        }

        // Clean up
        fs.unlinkSync(tempFilePath);

        await m.reply('✅ Successfully posted to your status!');
        await m.React('✅');

    } catch (error) {
        console.error('Post Command Error:', error);
        await m.reply('❌ Failed to post to status: ' + error.message);
        await m.React('❌');
    }
};

export default postCommand;
