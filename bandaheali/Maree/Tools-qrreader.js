import axios from 'axios';
import FormData from 'form-data';
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

        // Upload to API for scanning
        const form = new FormData();
        form.append('file', buffer, { 
            filename: 'qrcode.jpg',
            contentType: 'image/jpeg'
        });

        // Using reliable QR API
        const apiResponse = await axios.post(
            'https://api.qrserver.com/v1/read-qr-code/',
            form,
            {
                headers: form.getHeaders(),
                timeout: 15000
            }
        );

        if (!apiResponse.data?.[0]?.symbol?.[0]?.data) {
            throw new Error("No QR data found");
        }

        const qrData = apiResponse.data[0].symbol[0].data;

        // Format different QR types
        let resultMessage;
        if (qrData.startsWith('WIFI:')) {
            const wifiData = parseWifiQR(qrData);
            resultMessage = `📶 *WiFi Credentials*:\n\n` +
                          `🔹 SSID: ${wifiData.ssid}\n` +
                          `🔹 Password: ${wifiData.password || 'None'}\n` +
                          `🔹 Security: ${wifiData.security || 'WPA/WPA2'}`;
        } 
        else if (qrData.startsWith('http')) {
            resultMessage = `🌐 *Website URL*:\n${qrData}`;
        } 
        else {
            resultMessage = `📄 *Decoded Content*:\n${qrData}`;
        }

        // Send result
        await sendNewsletter(
            sock,
            m.from,
            `*✅ QR CODE DECODED*\n\n${resultMessage}\n\n🕒 ${new Date().toLocaleTimeString()}`,
            m,
            "🔍 Scan Successful",
            "API Powered"
        );
        await m.React('✅');

    } catch (error) {
        console.error("QR Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Scan Failed*\n\n" +
            "• Try clearer QR image\n" +
            "• Ensure good lighting\n" +
            "• Center QR properly\n" +
            "• Avoid reflections",
            m,
            "📲 QR Scanner",
            "Try Again"
        );
        await m.React('❌');
    }
};

// WiFi QR parser
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
