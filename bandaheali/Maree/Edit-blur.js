import Jimp from 'jimp';
import jsQR from 'jsqr';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const readqr = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  if (cmd !== 'readqr') return;

  try {
    if (!m.quoted?.message?.imageMessage) {
      return await sendNewsletter(
        sock,
        m.from,
        "⚠️ *Reply to a QR image first!*\n\n_Example: Reply to a QR code & type `.readqr`_",
        m,
        "📲 QR Code Reader",
        "Awaiting Image"
      );
    }

    await sock.sendPresenceUpdate('composing', m.from);
    await m.React('⏳');

    const buffer = await sock.downloadMediaMessage(m.quoted);
    if (!buffer) throw new Error("Image download failed");

    const image = await Jimp.read(buffer);
    image.greyscale().contrast(0.5).resize(600, Jimp.AUTO);

    const { data, width, height } = image.bitmap;
    const code = jsQR(new Uint8ClampedArray(data), width, height, {
      inversionAttempts: 'attemptBoth'
    });

    if (!code || !code.data) {
      throw new Error("QR not found");
    }

    // Decode data
    let result = '';
    if (code.data.startsWith('WIFI:')) {
      const wifi = parseWifiQR(code.data);
      result = `📶 *WiFi Credentials*\n\n` +
               `• *SSID:* ${wifi.ssid}\n` +
               `• *Password:* ${wifi.password || 'None'}\n` +
               `• *Security:* ${wifi.security || 'WPA/WPA2'}`;
    } else if (code.data.startsWith('http')) {
      result = `🌐 *URL Detected:*\n${code.data}`;
    } else if (/^[A-Za-z0-9+/=]{20,}$/.test(code.data)) {
      result = `🔐 *Encoded Text:*\n${code.data.slice(0, 40)}...`;
    } else {
      result = `📄 *Text Content:*\n${code.data}`;
    }

    await sendNewsletter(
      sock,
      m.from,
      `✅ *QR Code Decoded Successfully!*\n\n${result}\n\n🕒 _Scanned at:_ ${new Date().toLocaleTimeString()}`,
      m,
      "🔍 Scan Complete",
      "SARKAR-MD QR"
    );
    await m.React('✅');

  } catch (err) {
    console.error("QR Scan Error:", err.message);
    await sendNewsletter(
      sock,
      m.from,
      `❌ *Failed to decode QR code!*\n\n*Possible Issues:*\n` +
      `• Blurry or low-quality image\n` +
      `• QR not centered or too small\n` +
      `• Not a supported QR format\n\n_Try again with a clearer image._`,
      m,
      "⚠️ Scan Failed",
      "Try Again"
    );
    await m.React('❌');
  }
};

function parseWifiQR(data) {
  const result = { ssid: '', password: '', security: 'WPA/WPA2' };
  data.split(';').forEach(part => {
    if (part.startsWith('S:')) result.ssid = part.slice(2);
    if (part.startsWith('P:')) result.password = part.slice(2);
    if (part.startsWith('T:')) result.security = part.slice(2);
  });
  return result;
}

export default readqr;
