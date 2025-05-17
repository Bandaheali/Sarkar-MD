import yts from 'yt-search';
import config from '../../config.js';

const dlSong2 = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "song2" || cmd === "yta2") {
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

      // Fetch audio download link from the new API
      const apiUrl = `https://ab-ytdl.abrahamdw882.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!result.success || !result.data || !result.data.download) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch download link!" }, { quoted: m });
      }

      const { title, download } = result.data;
      const thumbnail = result.data.preview || '';

      await m.React('✅'); // React with a success icon

      sock.sendMessage(
        m.from,
        {
          audio: { url: download }, // Send audio instead of video
          mimetype: "audio/mpeg", // Correct mimetype for audio files
          ptt: false, // Set to true if you want voice note format
          fileName: `${title}.mp3`, // Proper filename with MP3 extension
          caption: `🎵 *Title:* ${title}\n📥 *Downloaded from:* YouTube\n\n*_POWERED BY Sarkar-MD_*`,
          contextInfo: {
            isForwarded: false,
            forwardingScore: 999,
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

export default dlSong2;
