import yts from 'yt-search';
import config from '../../config.cjs';
import GIFTED_DLS from 'gifted-dls';

const gifted = new GIFTED_DLS();

const dlSong = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "song" || cmd === "yta") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
    }

    await m.React('⏳'); // Loading icon

    try {
      // Search for the video using yt-search
      const searchResults = await yts(text);
      if (!searchResults.videos.length) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const video = searchResults.videos[0];
      const dlData = await gifted.ytmp3(video.url); // Gifted-DLS

      if (!dlData?.result?.download_url) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch download link!" }, { quoted: m });
      }

      const { title, thumbnail, duration, download_url } = dlData.result;

      await m.React('✅'); // Success icon

      sock.sendMessage(
        m.from,
        {
          audio: { url: download_url },
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${title}.mp3`,
          caption: `🎵 *Title:* ${title}\n⏱️ *Duration:* ${duration}\n📥 *Downloaded from:* Sarkar-MD\n\nPOWERED BY BANDAHEALI`,
          contextInfo: {
            isForwarded: false,
            forwardingScore: 999,
            externalAdReply: {
              title: "✨ Sarkar-MD ✨",
              body: "YouTube Audio Downloader",
              thumbnailUrl: thumbnail,
              sourceUrl: video.url,
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

export default dlSong;
