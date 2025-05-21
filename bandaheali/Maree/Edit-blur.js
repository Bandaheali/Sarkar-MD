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
        // Check if replied to an image
        if (!m.quoted?.message?.imageMessage) {
            await sendNewsletter(
                sock,
                m.from,
                "⚠️ *Please reply to an image with* `.removebg` *or* `.rmbg`",
                m,
                "🖼️ Background Remover",
                "Image Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Download image
        const mediaBuffer = await sock.downloadMediaMessage(m.quoted);

        // Upload to temporary host (Telegraph)
        const form = new FormData();
        form.append('file', mediaBuffer, { filename: 'image.jpg' });
        
        const uploadRes = await axios.post(
            'https://telegra.ph/upload',
            form,
            { headers: form.getHeaders() }
        );
        const imageUrl = 'https://telegra.ph' + uploadRes.data[0].src;

        // Process image through background removal API
        const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}`;
        
        // Get processed image (direct image response)
        const processedImageUrl = `${apiUrl}&timestamp=${Date.now()}`;

        // Send result with newsletter styling
        await sock.sendMessage(
            m.from,
            {
                image: { url: apiUrl },
                caption: "✅ *Background Removed Successfully*",
                contextInfo: {
                    externalAdReply: {
                        title: "✨ Sarkar-MD ✨",
                        body: "Professional Background Removal",
                        thumbnailUrl: processedImageUrl,
                        sourceUrl: "https://github.com/Sarkar-Bandaheali/Sarkar-MD",
                        mediaType: 1
                    }
                }
            },
            { quoted: m }
        );

        await m.React('✅');

    } catch (error) {
        console.error("RemoveBG Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Background Removal Failed!*\nPlease try another image",
            m,
            "🖼️ Background Remover",
            "API Error"
        );
        await m.React('❌');
    }
};

export default removebg;
