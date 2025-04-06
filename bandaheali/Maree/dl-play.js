import yts from 'yt-search';
import config from '../../config.cjs';

const dlPlay = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "play") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
    }

    await m.React('⏳');

    try {
      let videoUrl = '';
      if (text.includes("youtube.com") || text.includes("youtu.be")) {
        videoUrl = text;
      } else {
        const searchResults = await yts(text);
        if (!searchResults.videos.length) {
          return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
        }
        videoUrl = searchResults.videos[0].url;
      }

      const apiUrl = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!result.status || !result.result || !result.result.downloadUrl) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch audio!" }, { quoted: m });
      }

      const { title, downloadUrl, quality } = result.result;

      await m.React('✅');

      await sock.sendMessage(
        m.from,
        {
          audio: { url: downloadUrl },
          mimetype: 'audio/mpeg',
          ptt: false,
          fileName: `${title}.mp3`,
          caption: `🎵 *Title:* ${title}\n🎚️ *Quality:* ${quality}\n⚡️ *Powered by Keith API*`,
        },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in dlPlay command:", error);
      await m.React('❌');
      sock.sendMessage(m.from, { text: "❌ An error occurred while processing your request!" }, { quoted: m });
    }
  }
};

export default dlPlay;
