
import yts from 'yt-search';
import config from '../../config.js';

const dlSong4 = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "song4" || cmd === "yta4") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
    }

    await m.React('⏳'); // React with a loading icon

    try {
      // Search for the video using yt-search
      const searchResults = await yts(text);
      if (!searchResults.videos.length) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const video = searchResults.videos[0]; // Get the first result
      const videoUrl = video.url;

      // New API endpoint
      const apiUrl = `https://linguistic-agneta-bandah-ealimaree-5e6480eb.koyeb.app/api/youtube/audio?url=${encodeURIComponent(videoUrl)}&apikey=Alphabot`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.status !== 200 || !result.result?.audio) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch download link!" }, { quoted: m });
      }

      const { title, audio } = result.result;
      const thumbnail = video.thumbnail;

      await m.React('✅'); // React with a success icon

      sock.sendMessage(
        m.from,
        {
          audio: { url: audio },
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${title}.mp3`,
          caption: `🎵 *Title:* ${title}\n📥 *Downloaded from:* Sarkar-MD\n\nPOWERED BY BANDAHEALI`,
          contextInfo: {
            isForwarded: false,
            forwardingScore: 999,
            externalAdReply: {
              title: "✨ Sarkar-MD ✨",
              body: "YouTube Audio Downloader",
              thumbnailUrl: thumbnail,
              sourceUrl: videoUrl,
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in dlSong command:", error);
      sock.sendMessage(m.from, { text: "❌ An error occurred while processing your request!" }, { quoted: m });
    }
  }
};

export default dlSong4;
