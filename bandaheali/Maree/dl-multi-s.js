import axios from 'axios';
import config from '../../config.cjs';

const playHandler = async (m, sock) => {
  try {
    // Basic validation
    if (!m?.from || !m?.body || !sock) {
      console.error('Invalid message or socket object');
      return;
    }

    const prefix = config.PREFIX || '!';
    const body = m.body || '';
    
    // Check if message starts with prefix
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

        // First send audio
        try {
          await sock.sendMessage(
            m.from,
            {
              audio: { url: download_url },
              mimetype: "audio/mpeg",
              caption: `🎵 *${title}*\n⏱ ${duration}`,
              thumbnail: thumbnail
            },
            { quoted: m }
          );
          await m.React('🎵');
        } catch (audioError) {
          console.error("Error sending audio:", audioError);
          await sock.sendMessage(m.from, { text: "❌ Failed to send audio!" }, { quoted: m });
        }

        // Then send video
        try {
          await sock.sendMessage(
            m.from,
            {
              video: { url: download_url },
              mimetype: "video/mp4",
              caption: `🎬 *${title}*\n⏱ ${duration}`,
              thumbnail: thumbnail
            },
            { quoted: m }
          );
          await m.React('🎬');
        } catch (videoError) {
          console.error("Error sending video:", videoError);
          await sock.sendMessage(m.from, { text: "❌ Failed to send video!" }, { quoted: m });
        }

      } catch (error) {
        console.error("Error in play command:", error);
        await sock.sendMessage(m.from, { text: "❌ Failed to process your request!" }, { quoted: m });
        await m.React('❌');
      }
    }
  } catch (error) {
    console.error('Critical error in playHandler:', error);
  }
};

export default playHandler;
