import axios from 'axios';
import config from '../../config.cjs';

const collectors = new Map();

const playHandler = async (m, sock) => {
  try {
    const prefix = config.PREFIX || '!';
    const body = m.body || '';
    if (!body.startsWith(prefix)) return;

    const cmd = body.slice(prefix.length).split(' ')[0].toLowerCase();
    const text = body.slice(prefix.length + cmd.length).trim();

    // Handle reply (1 or 2)
    const collector = collectors.get(m.sender);
    if (collector && (body === '1' || body === '2')) {
      const { download_url, title, duration, thumbMsg } = collector;

      if (body === '1') {
        await sock.sendMessage(m.from, {
          video: { url: download_url },
          mimetype: "video/mp4",
          caption: `🎬 *${title}*\n⏱ Duration: ${duration}`
        }, { quoted: thumbMsg });
        await m.React('🎬');
      } else if (body === '2') {
        await sock.sendMessage(m.from, {
          audio: { url: download_url },
          mimetype: "audio/mpeg",
          caption: `🎵 *${title}*\n⏱ Duration: ${duration}`
        }, { quoted: thumbMsg });
        await m.React('🎵');
      }

      collectors.delete(m.sender);
      return;
    }

    // Actual command: !mix
    if (cmd === "mix") {
      if (!text) {
        await sock.sendMessage(m.from, { text: "🔎 Please provide a song name!" }, { quoted: m });
        await m.React('❌');
        return;
      }

      await m.React('⏳');

      const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data?.status || !data?.result) {
        await sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
        await m.React('❌');
        return;
      }

      const { title = 'Unknown', download_url, thumbnail, duration = '0:00' } = data.result;

      const caption = `🎵 *${title}*\n⏱ Duration: ${duration}\n🔗 ${download_url}\n\n*Reply with:*\n1️⃣ Video\n2️⃣ Audio`;

      const sentMsg = await sock.sendMessage(m.from, {
        image: { url: thumbnail },
        caption
      }, { quoted: m });

      // Store collector
      collectors.set(m.sender, {
        download_url,
        title,
        duration,
        thumbMsg: sentMsg
      });

      // Timeout after 30s
      setTimeout(() => {
        if (collectors.has(m.sender)) collectors.delete(m.sender);
      }, 30000);
    }
  } catch (err) {
    console.error('playHandler Error:', err);
    await sock.sendMessage(m.from, { text: "❌ Failed to process your request!" }, { quoted: m });
    await m.React('❌');
  }
};

export default playHandler;
