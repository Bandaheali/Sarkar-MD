import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';
import QrCode from 'qrcode-reader';
import Jimp from 'jimp';
import axios from 'axios';

const qrread = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (cmd !== "qrread") return;

    try {
        // Check if replied to an image
        if (!m.quoted?.message?.imageMessage) {
            await sendNewsletter(
                sock,
                m.from,
                "⚠️ *Reply to an image containing QR code*\nExample: Reply to QR code image and type `.qrread`",
                m,
                "📲 QR Reader",
                "Image Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Download image
        const mediaBuffer = await sock.downloadMediaMessage(m.quoted);

        // Process with JIMP + QR Reader
        const image = await Jimp.read(mediaBuffer);
        const qr = new QrCode();
        
        const decodedText = await new Promise((resolve, reject) => {
            qr.callback = (err, value) => err ? reject(err) : resolve(value?.result);
            qr.decode(image.bitmap);
        });

        if (!decodedText) {
            throw new Error("No QR code found");
        }

        // Send result
        await sendNewsletter(
            sock,
            m.from,
            `*QR Code Content:*\n\n${decodedText}\n\n🔍 *Scanned Successfully*`,
            m,
            "✅ QR Decoded",
            "Powered by Sarkar-MD"
        );
        await m.React('✅');

    } catch (error) {
        console.error("QR Read Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            `❌ *QR Decode Failed*\n\n${error.message.includes("No QR") ? "No QR code detected" : "Try with clearer image"}`,
            m,
            "📲 QR Reader",
            "Detection Failed"
        );
        await m.React('❌');
    }
};

export default qrread;
