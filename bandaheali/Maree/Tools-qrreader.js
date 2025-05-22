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

        // Download image
        const buffer = await sock.downloadMediaMessage(m.quoted);
        const image = await Jimp.read(buffer);
        
        // Enhance image for better scanning
        image
            .greyscale()
            .contrast(0.4)
            .normalize();

        const { data, width, height } = image.bitmap;
        
        // Multiple scan attempts
        const code = jsQR(new Uint8ClampedArray(data), width, height, {
            inversionAttempts: 'attemptBoth'
        });

        if (!code) {
            throw new Error("No QR code detected");
        }

        // Special handling for WiFi QR codes
        let resultMessage;
        if (code.data.startsWith('WIFI:')) {
            const wifiData = parseWifiQR(code.data);
            resultMessage = `📶 *WiFi Credentials Found*:\n\n` +
                           `🔹 *SSID:* ${wifiData.ssid}\n` +
                           `🔹 *Password:* ${wifiData.password || 'None'}\n` +
                           `🔹 *Security:* ${wifiData.security || 'WPA/WPA2'}`;
        } 
        // Handling for other QR types
        else if (code.data.startsWith('http')) {
            resultMessage = `🌐 *Website URL*:\n${code.data}`;
        } else if (code.data.match(/^[A-Za-z0-9+/=]+$/) && code.data.length > 20) {
            resultMessage = `🔐 *Encoded Data*:\n${code.data.substring(0, 30)}...`;
        } else {
            resultMessage = `📄 *Text Content*:\n${code.data}`;
        }

        // Send result
        await sendNewsletter(
            sock,
            m.from,
            `*✅ QR CODE DECODED*\n\n${resultMessage}\n\n🕒 Scanned at: ${new Date().toLocaleTimeString()}`,
            m,
            "🔍 Scan Successful",
            "Powered by Sarkar-MD"
        );
        await m.React('✅');

    } catch (error) {
        console.error("QR Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Failed to scan QR code*\n\nPossible reasons:\n" +
            "• QR code is blurry/damaged\n" +
            "• Poor lighting conditions\n" +
            "• QR is too small in the image\n" +
            "• Unsupported QR format",
            m,
            "📲 QR Scanner",
            "Try Again"
        );
        await m.React('❌');
    }
};

// Special function to parse WiFi QR codes
function parseWifiQR(data) {
    const result = { ssid: '', password: '', security: 'WPA/WPA2' };
    data.split(';').forEach(part => {
        if (part.startsWith('S:')) result.ssid = part.substring(2);
        if (part.startsWith('P:')) result.password = part.substring(2);
        if (part.startsWith('T:')) result.security = part.substring(2);
    });
    return result;
}

export default readqr;
