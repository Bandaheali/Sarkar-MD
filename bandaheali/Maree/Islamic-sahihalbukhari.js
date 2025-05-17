import config from '../../config.js'; // Ensure this matches your project setup
import axios from 'axios'; // Install axios if not already installed: npm install axios

const sahihalbukhari = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const query = m.body.slice(prefix.length + cmd.length).trim();

  // Check for command aliases
  if (cmd === "sahihalbukhari" || cmd === "sahialbukhari" || cmd === "sbukhari") {
    if (!query || isNaN(query) || query < 1) {
      return sock.sendMessage(
        m.from,
        { text: "⚠️ براہ کرم ایک درست نمبر درج کریں۔\nمثال: `!sahihalbukhari 1` یا `!sahialbukhari 1` یا `!sbukhari 1`" },
        { quoted: m }
      );
    }

    await m.React("⏳");
    try {
      const response = await axios.get(`https://api.nexoracle.com/islamic/hadith-sahih-al-bukhari?q=${query}/ur`);
      const data = response.data?.result?.data?.hadiths[0]; // Extract the first Hadith from the array
      if (!data) throw new Error("Invalid API response");

      const { hadithnumber, arabicnumber, text } = data;
      const messageText = `📖 *حدیث نمبر ${hadithnumber} (عربی نمبر ${arabicnumber}):*\n\n${text}\n\n⚠️ *نوٹ:* یہ احادیث ایک API سے حاصل کی گئی ہیں۔ براہ کرم صحیح بخاری کی کتاب سے بھی تصدیق کر لیں۔\n\n*_POWERED BY SARKAR-MD_*`;

      await sock.sendMessage(
        m.from,
        {
          text: messageText,
          contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363315182578784@newsletter",
              newsletterName: "Sarkar-MD",
              serverMessageId: -1,
            },
            externalAdReply: {
              title: "✨ Sarkar-MD ✨",
              body: "Read Sahih al-Bukhari Hadith",
              thumbnailUrl: "https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp",
              sourceUrl: "https://github.com/Sarkar-Bandaheali/Sarkar-MD",
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        },
        { quoted: m }
      );
      await m.React("✅");
    } catch (error) {
      console.error(error);
      await m.React("❌");
      sock.sendMessage(
        m.from,
        { text: "⚠️ معاف کیجیے، حدیث حاصل کرنے میں مسئلہ ہوا۔ دوبارہ کوشش کریں۔" },
        { quoted: m }
      );
    }
  }
};

export default sahihalbukhari;
