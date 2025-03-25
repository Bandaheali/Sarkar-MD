import axios from 'axios';
import config from '../../config.cjs';

const attp = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "attp") {
    if (!text) {
      return await sock.sendMessage(m.from, { text: "⚠️ *Please provide text for the sticker!*" }, { quoted: m });
    }

    await m.React('⏳'); // Loading reaction

    try {
      const apiUrl = `https://api.nexoracle.com/image-creating/attp?apikey=sarkar_786&text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      await sock.sendMessage(
        m.from,
        { sticker: Buffer.from(response.data) }, // Sticker as WebP
        { quoted: m }
      );

      await m.React('✅'); // Success reaction
    } catch (error) {
      await m.React('❌'); // Error reaction
      await sock.sendMessage(m.from, { text: "⚠️ *Error fetching ATTP sticker!*" }, { quoted: m });
      console.error("ATTP API Error:", error);
    }
  }
};

export default attp;
