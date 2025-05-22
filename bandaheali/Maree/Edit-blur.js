import axios from 'axios';
import FormData from 'form-data';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const IMGBB_API_KEY = "e909ac2cc8d50250c08f176afef0e333"; // Your ImgBB API key

const removebg = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (!['removebg', 'rmbg'].includes(cmd)) return;

    try {
        // Validate quoted image
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

        // 1. Download image
        const mediaBuffer = await sock.downloadMediaMessage(m.quoted);
        if (!mediaBuffer || mediaBuffer.length < 1024) {
            throw new Error('Invalid image (too small or corrupted)');
        }

        // 2. Upload to ImgBB
        const formData = new FormData();
        formData.append('image', mediaBuffer.toString('base64'));
        
        const uploadRes = await axios.post(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 15000
            }
        );

        if (!uploadRes.data?.data?.url) {
            throw new Error('Image upload failed');
        }
        const imageUrl = uploadRes.data.data.url;

        // 3. Process through RemoveBG API
        const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}`;
        
        // 4. Get and verify result
        const result = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        if (!result.data || result.data.length < 1024) {
            throw new Error('Empty result from API');
        }

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
        console.error("RemoveBG Error:", error.message);
        await sendNewsletter(
            sock,
            m.from,
            `❌ *Background Removal Failed*\n\n▸ Reason: ${getErrorMessage(error)}\n▸ Solution: ${getSolution(error)}`,
            m,
            "🖼️ Error Occurred",
            "Try again later"
        );
        await m.React('❌');
    }
};

function getErrorMessage(error) {
    if (error.message.includes('Invalid image')) return "Corrupted image data";
    if (error.message.includes('Image upload')) return "Image hosting failed";
    if (error.message.includes('timeout')) return "Process timed out";
    if (error.message.includes('Empty result')) return "API returned no image";
    return "Processing error";
}

function getSolution(error) {
    if (error.message.includes('timeout')) return "Try smaller image (<2MB)";
    if (error.message.includes('upload')) return "Check your internet connection";
    return "Send a different image";
}

export default removebg;
