import axios from 'axios';
import FormData from 'form-data';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const removebg = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (!['removebg', 'rmbg'].includes(cmd)) return;

    try {
        // Validate quoted message
        if (!m.quoted?.message?.imageMessage) {
            await sendNewsletter(
                sock,
                m.from,
                "⚠️ *Invalid Usage!*\nPlease reply to an image with `.removebg` or `.rmbg`",
                m,
                "🖼️ Background Remover",
                "Command Help"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // 1. Download image with error handling
        let mediaBuffer;
        try {
            mediaBuffer = await sock.downloadMediaMessage(m.quoted);
            if (!mediaBuffer || mediaBuffer.length === 0) {
                throw new Error('Empty media buffer');
            }
        } catch (downloadError) {
            throw new Error('Cannot download image (may be expired)');
        }

        // 2. Upload to temp host (Catbox)
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', mediaBuffer, 'image.jpg');

        const uploadRes = await axios.post(
            'https://catbox.moe/user/api.php',
            form,
            {
                headers: form.getHeaders(),
                timeout: 20000
            }
        );

        const imageUrl = uploadRes.data.trim();
        if (!imageUrl.startsWith('http')) {
            throw new Error('Image upload failed');
        }

        // 3. Process through API
        const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}`;
        
        // 4. Get result (direct image)
        const result = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        // 5. Send result
        await sock.sendMessage(
            m.from,
            {
                image: result.data,
                caption: "✅ *Background Removed Successfully*",
                contextInfo: {
                    externalAdReply: {
                        title: "✨ Sarkar-MD ✨",
                        body: "Professional Background Removal",
                        thumbnail: result.data,
                        sourceUrl: "https://github.com/Sarkar-Bandaheali/Sarkar-MD",
                        mediaType: 1
                    }
                }
            },
            { quoted: m }
        );
        await m.React('✅');

    } catch (error) {
        await sendNewsletter(
            sock,
            m.from,
            `❌ *Background Removal Failed*\n\n▸ Reason: ${error}\n▸ Solution: Try with a fresh image`,
            m,
            "🖼️ Error Occurred",
            "Support available"
        );
        await m.React('❌');
    }
};

export default removebg;
