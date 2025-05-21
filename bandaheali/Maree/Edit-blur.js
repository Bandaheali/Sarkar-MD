import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';
import axios from 'axios';
import FormData from 'form-data';

const blur = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (cmd !== "blur") return;

    try {
        // Check if replied to an image
        if (!m.quoted?.message?.imageMessage) {
            await sendNewsletter(
                sock,
                m.from,
                "❌ *Reply to an image first!*\nExample: Reply to an image and type `.blur`",
                m,
                "🖼️ Blur Tool",
                "Image Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Download image
        const media = await sock.downloadMediaMessage(m.quoted);
        
        // Prepare API request
        const form = new FormData();
        form.append('image', media, 'image.jpg');

        // The API URL that directly returns the image
        const apiUrl = 'https://api.siputzx.my.id/api/iloveimg/blurface';

        // Get the blurred image URL
        const blurredImageUrl = `${apiUrl}?timestamp=${Date.now()}`; // Add timestamp to avoid caching

        // Send the image directly to WhatsApp
        await sock.sendMessage(
            m.from,
            { 
                image: { url: blurredImageUrl }, // Direct image URL
                caption: "✅ *Blurred Image* (Powered by Sarkar-MD)"
            },
            { quoted: m }
        );

        await m.React('✅');

    } catch (error) {
        console.error("Blur Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "⚠️ *Blur Failed!*\nPlease try again with another image",
            m,
            "🖼️ Blur Tool",
            "Error"
        );
        await m.React('❌');
    }
};

export default blur;
