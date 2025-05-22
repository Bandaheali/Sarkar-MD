import QRCode from 'qrcode';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const texttoqr = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "texttoqr") return;

    try {
        // Check if text is provided
        if (!text) {
            await sendNewsletter(
                sock,
                m.from,
                "⚠️ *Please provide text to convert*\nExample: `.texttoqr Hello World`",
                m,
                "🔠 Text to QR",
                "Input Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Generate QR code
        const qrBuffer = await QRCode.toBuffer(text, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Send QR code
        await sock.sendMessage(
            m.from,
            {
                image: qrBuffer,
                caption: `✅ *QR Code Generated*\n\n📝 *Original Text:* ${text}`,
                contextInfo: {
                    externalAdReply: {
                        title: "✨ Sarkar-MD ✨",
                        body: "Text to QR Generator",
                        thumbnail: qrBuffer,
                        sourceUrl: "https://github.com/Sarkar-Bandaheali/Sarkar-MD",
                        mediaType: 1
                    }
                }
            },
            { quoted: m }
        );
        await m.React('✅');

    } catch (error) {
        console.error("QR Generation Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *QR Generation Failed*\n\nPossible reasons:\n• Text too long\n• Invalid characters\n• Server error",
            m,
            "🔠 Text to QR",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default texttoqr;
