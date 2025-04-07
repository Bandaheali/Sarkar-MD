import axios from 'axios';
import config from '../../config.cjs';

const playHandler = async (m, sock) => {
  try {
    if (!m?.from || !m?.body || !sock) return;

    const prefix = config.PREFIX || '!';
    const body = m.body || '';
    if (!body.startsWith(prefix)) return;

    const cmd = body.slice(prefix.length).split(' ')[0].toLowerCase();
    const text = body.slice(prefix.length + cmd.length).trim();

    if (cmd === "mix") {
      if (!text) {
        await sock.sendMessage(m.from, { text: "🔎 Please provide a song name or artist!" }, { quoted: m });
        await m.React('❌');
        return;
      }

      await m.React('⏳');

      try {
        const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data?.status || !data?.result) {
          await sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
          await m.React('❌');
          return;
        }

        const { title = 'Unknown', download_url, thumbnail, duration = '0:00' } = data.result;
        const caption = `🎵 *${title}*\n⏱ Duration: ${duration}\n🔗 ${download_url}\n\n*Reply with:*\n1️⃣ for *Video*\n2️⃣ for *Audio*`;

        // Send thumbnail and options
        await sock.sendMessage(m.from, {
          image: { url: thumbnail },
          caption
        }, { quoted: m });

        // Wait for reply
        const reply = await sock.awaitMessage(m.from, m.sender, 30000); // 30 seconds
        if (!reply || !reply.body) {
          await sock.sendMessage(m.from, { text: "⌛ Timeout! Please try again." }, { quoted: m });
          return;
        }

        const choice = reply.body.trim();
        if (choice === '1') {
          await m.React('📹');
          await sock.sendMessage(
            m.from,
            {
              video: { url: download_url },
              mimetype: "video/mp4",
              caption: `🎬 *${title}*\n⏱ ${duration}`
            },
            { quoted: m }
          );
        } else if (choice === '2') {
          await m.React('🎧');
          await sock.sendMessage(
            m.from,
            {
              audio: { url: download_url },
              mimetype: "audio/mpeg",
              caption: `🎵 *${title}*\n⏱ ${duration}`
            },
            { quoted: m }
          );
        } else {
          await sock.sendMessage(m.from, { text: "❌ Invalid choice! Reply with 1 or 2." }, { quoted: m });
        }

      } catch (error) {
        console.error("Error in mix command:", error);
        await sock.sendMessage(m.from, { text: "❌ Failed to process your request!" }, { quoted: m });
        await m.React('❌');
      }
    }
  } catch (error) {
    console.error('Critical error in playHandler:', error);
  }
};

export default playHandler;
