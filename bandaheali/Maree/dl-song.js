import yts from 'yt-search';
import config from '../../config.cjs';

const dlSong = async (m, sock) => { 
  const prefix = config.PREFIX; 
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : ''; 
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "song" || cmd === "yta") { 
    if (!text) { 
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m }); 
    }

    await m.React('⏳'); // React with loading icon

    try {
      // Search video on YouTube
      const searchResults = await yts(text);
      if (!searchResults.videos.length) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;

      // Call the new API
      const apiUrl = `https://home.lazacktech.biz.id/api/ytdl?url=${encodeURIComponent(videoUrl)}&format=mp3`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.status !== 200 || !result.download_link) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch audio download link!" }, { quoted: m });
      }

      const { title, download_link } = result;

      await m.React('✅'); // React with success

      sock.sendMessage(
        m.from,
        {
          audio: { url: download_link },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          caption: `🎵 *Title:* ${title}\n📥 *Downloaded from:* Sarkar-MD\n\nPOWERED BY BANDAHEALI`,
          contextInfo: {
            isForwarded: false,
            forwardingScore: 999,
            externalAdReply: {
              title: "✨ Sarkar-MD ✨",
              body: "YouTube MP3 Downloader",
              thumbnailUrl: video.thumbnail,
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
      await m.React('❌');
    }
  }
};

export default dlSong;
