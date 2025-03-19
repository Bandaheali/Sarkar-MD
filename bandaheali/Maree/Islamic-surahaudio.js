import config from '../../config.cjs'; // Ensure this matches your project setup
import axios from 'axios'; // Install axios if not already installed: npm install axios

const surahaudio = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const query = m.body.slice(prefix.length + cmd.length).trim();

  // ✅ --- SURAH AUDIO COMMAND --- ✅
  if (cmd === "surahaudio") {
    await m.React("⏳");
    try {
      const response = await axios.get(`https://api.nexoracle.com/islamic/quran-surah?q=${query}/ur`);
      const data = response.data?.result;
      if (!data || !data.surah_details) throw new Error("Invalid API response");

      const { title_en, title_ar, verses, place, type } = data.surah_details;
      const audioUrl = data.audio_ar;
      const caption = `📖 *${title_en}* (${title_ar})\n🕌 *Place:* ${place}\n📜 *Type:* ${type}\n🔢 *Verses:* ${verses}\n\n🚀 *_Sarkar-MD Powered by BANDAHEALI_*`;

      await sock.sendMessage(
        m.from,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mp4",
          caption: caption,
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
              body: "Listen to Surah Audio",
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
        { text: "*_⚠️ FAILED TO FETCH SURAH MAY BE API GONE DOWN_*"},
        { quoted: m }
      );
    }
  }
};

export default surahaudio;
