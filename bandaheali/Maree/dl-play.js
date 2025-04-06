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

    await m.React('⏳'); // Loading...

    try {
      const searchResults = await yts(text);
      if (!searchResults.videos.length) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;

      const apiUrl = `https://api.sparky.biz.id/api/downloader/song?search=${videoUrl}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!result.status || !result.data || !result.data.dl) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch audio!" }, { quoted: m });
      }

      const { title, dl } = result.data;

      await m.React('✅'); // Success

      // Send as audio with playable format
      await sock.sendMessage(
        m.from,
        {
          audio: { url: dl },
          mimetype: 'audio/mpeg',
          ptt: false, // false means normal audio, not voice note
          fileName: `${title}.mp3`,
          caption: `🎵 *Title:* ${title}\n📥 *Powered by SPARKY API*`,
        },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in dlPlay command:", error);
      sock.sendMessage(m.from, { text: "❌ An error occurred!" }, { quoted: m });
    }
  }
};

export default dlPlay;
