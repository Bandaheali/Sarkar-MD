import yts from 'yt-search';
import config from '../../config.js';
import { yta, ytv } from '../../lib/y2mate.js'; // Updated import

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
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const video = searchResults.videos[0]; // Get the first result
      const videoUrl = video.url;
      const isVideoRequest = cmd === "yta2" && text.includes("--video");

      let downloadInfo;
      if (isVideoRequest) {
        // Get video download info
        downloadInfo = await ytv(videoUrl);
      } else {
        // Get audio download info
        downloadInfo = await yta(videoUrl);
      }

      if (!downloadInfo || !downloadInfo.link) {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "❌ Failed to get download link!" }, { quoted: m });
      }

      await m.React('✅'); // React with a success icon

      if (isVideoRequest) {
        // Send video
        sock.sendMessage(
          m.from,
          {
            video: { url: downloadInfo.link },
            mimetype: "video/mp4",
            caption: `🎬 *Title:* ${video.title}\n⏱️ *Duration:* ${video.timestamp}\n📥 *Downloaded from:* YouTube\n\n*_POWERED BY Sarkar-MD_*`,
            thumbnail: { url: downloadInfo.thumb },
            contextInfo: {
              isForwarded: false,
              forwardingScore: 999,
            },
          },
          { quoted: m }
        );
      } else {
        // Send audio
        sock.sendMessage(
          m.from,
          {
            audio: { url: downloadInfo.link },
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: downloadInfo.output,
            caption: `🎵 *Title:* ${video.title}\n⏱️ *Duration:* ${video.timestamp}\n📥 *Downloaded from:* YouTube\n\n*_POWERED BY Sarkar-MD_*`,
            contextInfo: {
              isForwarded: false,
              forwardingScore: 999,
            },
          },
          { quoted: m }
        );
      }
    } catch (error) {
      console.error("Error in dlSong2 command:", error);
      await m.React('❌');
      sock.sendMessage(m.from, { 
        text: "❌ An error occurred while processing your request!\n\nError: " + error.message 
      }, { quoted: m });
    }
  }
};

export default dlSong2;
