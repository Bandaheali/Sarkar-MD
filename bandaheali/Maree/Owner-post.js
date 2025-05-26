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
        // Get the quoted message (if any)
        const quotedMsg = m.quoted?.message;
        let mediaBuffer;
        let mediaType;
        let caption = m.body.slice(prefix.length + 'post'.length).trim();

        // Helper function to download media safely
        const downloadMedia = async (msg) => {
            try {
                const buffer = await sock.downloadMediaMessage(msg);
                if (!buffer || buffer.length === 0) {
                    throw new Error('Empty media buffer');
                }
                return buffer;
            } catch (error) {
                console.error('Download failed:', error);
                throw new Error('Could not download media');
            }
        };

        // Case 1: Direct media message
        if (!m.quoted) {
            if (m.message?.imageMessage) {
                mediaBuffer = await downloadMedia(m);
                mediaType = 'image';
            } 
            else if (m.message?.videoMessage) {
                mediaBuffer = await downloadMedia(m);
                mediaType = 'video';
            } 
            else if (m.message?.audioMessage) {
                mediaBuffer = await downloadMedia(m);
                mediaType = 'audio';
            }
            else {
                await m.reply('❌ Please attach media or reply to media with *.post*');
                return;
            }
        }
        // Case 2: Quoted media message
        else {
            if (quotedMsg?.imageMessage) {
                mediaBuffer = await downloadMedia(m.quoted);
                mediaType = 'image';
            } 
            else if (quotedMsg?.videoMessage) {
                mediaBuffer = await downloadMedia(m.quoted);
                mediaType = 'video';
            } 
            else if (quotedMsg?.audioMessage) {
                mediaBuffer = await downloadMedia(m.quoted);
                mediaType = 'audio';
            }
            else {
                await m.reply('❌ The replied message has no media');
                return;
            }
        }

        // Verify media buffer
        if (!mediaBuffer || mediaBuffer.length === 0) {
            throw new Error('Received empty media buffer');
        }

        // Determine file type
        const fileInfo = await fileTypeFromBuffer(mediaBuffer);
        if (!fileInfo) {
            throw new Error('Could not determine file type');
        }

        // Create temp directory if not exists
        if (!fs.existsSync('./temp')) {
            fs.mkdirSync('./temp');
        }

        const tempFilePath = `./temp/post_${Date.now()}.${fileInfo.ext}`;
        fs.writeFileSync(tempFilePath, mediaBuffer);

        // Status upload options
        const statusOptions = {
            ephemeralExpiration: 86400,
            mediaUploadTimeoutMs: 60000
        };

        // Prepare media payload
        let mediaPayload;
        const fileContent = fs.readFileSync(tempFilePath);
        
        switch (mediaType) {
            case 'image':
                mediaPayload = { 
                    image: fileContent,
                    caption: caption || '',
                    mimetype: fileInfo.mime
                };
                break;
            case 'video':
                mediaPayload = { 
                    video: fileContent,
                    caption: caption || '',
                    mimetype: fileInfo.mime
                };
                break;
            case 'audio':
                mediaPayload = {
                    audio: fileContent,
                    mimetype: fileInfo.mime,
                    ptt: true
                };
                break;
        }

        // Upload to status
        await sock.sendMessage(
            'status@broadcast',
            mediaPayload,
            statusOptions
        );

        // Clean up
        fs.unlinkSync(tempFilePath);

        await m.reply('✅ Successfully posted to your status!');
        await m.React('✅');

    } catch (error) {
        console.error('Post Command Error:', error);
    
        await m.reply(error);
        await m.React('❌');
    }
};

export default postCommand;
