import Jimp from 'jimp';
import jsQR from 'jsqr';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const readqr = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (cmd !== "readqr") return;

    try {
        // Check if replied to an image
        if (!m.quoted?.message?.imageMessage) {
            await sendNewsletter(
                sock,
                m.from,
                "⚠️ *Reply to an image containing QR code*\nExample: Reply to QR code and type `.readqr`",
                m,
                "📲 QR Scanner",
                "Image Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Download and process image
        const buffer = await sock.downloadMediaMessage(m.quoted);
        const image = await Jimp.read(buffer);
        
        // Enhance image for better detection
        image.greyscale().contrast(0.2);

        const { data, width, height } = image.bitmap;
        const code = jsQR(new Uint8ClampedArray(data), width, height, {
            inversionAttempts: 'dontInvert'
        });

        if (!code) {
            throw new Error("Couldn't detect QR code");
        }

        // Format different QR types
        let resultMessage;
        if (code.data.startsWith('http')) {
            resultMessage = `🔗 *URL Found:*\n${code.data}`;
        } else if (code.data.includes('\n')) {
            resultMessage = `📝 *Multi-line Text:*\n${code.data}`;
        } else {
            resultMessage = `📄 *Decoded Text:*\n${code.data}`;
        }

        // Send result
        await sendNewsletter(
            sock,
            m.from,
            `*QR SCAN SUCCESS* ✅\n\n${resultMessage}\n\n🕒 ${new Date().toLocaleTimeString()}`,
            m,
            "📲 QR Result",
            "Powered by Sarkar-MD"
        );
        await m.React('✅');

    } catch (error) {
        console.error("QR Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            `❌ *QR Scan Failed*\n\n${getErrorMessage(error)}`,
            m,
            "📲 QR Scanner",
            "Try again"
        );
        await m.React('❌');
    }
};

function getErrorMessage(error) {
    if (error.message.includes("detect QR")) {
        return "• No QR code detected\n• Try with clearer image";
    } else if (error.message.includes("Jimp.read")) {
        return "• Invalid image format\n• Use JPEG/PNG";
    } else {
        return "• Processing error\n• Try different image";
    }
}

export default readqr;
