import yts from 'yt-search';
import config from '../../config.cjs';

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

    await m.React('⏳'); // React with a loading icon

    try {
      let videoUrl, videoTitle, thumbnailUrl;
      
      // Check if the input is a YouTube URL
      const isYoutubeUrl = text.match(/(youtube\.com|youtu\.be)/i);
      
      if (isYoutubeUrl) {
        // Extract video ID from various YouTube URL formats
        const videoId = text.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)[1];
        videoUrl = `https://youtube.com/watch?v=${videoId}`;
        
        // Get video info for title and thumbnail
        const videoInfo = await yts({ videoId });
        videoTitle = videoInfo.title;
        thumbnailUrl = videoInfo.thumbnail;
      } else {
        // Search for the video using yt-search
        const searchResults = await yts(text);
        if (!searchResults.videos.length) {
          return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
        }
        
        const video = searchResults.videos[0]; // Get the first result
        videoUrl = video.url;
        videoTitle = video.title;
        thumbnailUrl = video.thumbnail;
      }

      // Try multiple APIs in sequence
      let downloadUrl;
      const apis = [
        {
          url: `https://exonity.tech/api/ytdl-download?url=${videoUrl}&type=audio`,
          processor: (data) => data.data?.url
        },
        {
          url: `https://apidl.asepharyana.cloud/api/downloader/ytmp3?url=${videoUrl}`,
          processor: (data) => data.url
        },
        {
          url: `https://bandahealimaree-api-ytdl.hf.space/api/ytmp3?url=${videoUrl}`,
          processor: (data) => data.download?.downloadUrl
        }
      ];

      for (const api of apis) {
        try {
          const response = await fetch(api.url);
          if (!response.ok) continue;
          
          const result = await response.json();
          downloadUrl = api.processor(result);
          
          if (downloadUrl) {
            // Update title and thumbnail if available from API
            if (result.data?.title) videoTitle = result.data.title;
            if (result.data?.thumbnail) thumbnailUrl = result.data.thumbnail;
            if (result.title) videoTitle = result.title;
            if (result.thumbnail) thumbnailUrl = result.thumbnail;
            break;
          }
        } catch (e) {
          console.error(`Error with API ${api.url}:`, e);
          continue;
        }
      }

      if (!downloadUrl) {
        return sock.sendMessage(m.from, { text: "❌ All download services are currently unavailable!" }, { quoted: m });
      }

      await m.React('✅'); // React with a success icon

      sock.sendMessage(
        m.from,
        {
          audio: { url: downloadUrl },
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${videoTitle}.mp3`.replace(/[<>:"\/\\|?*]+/g, '_'), // Sanitize filename
          caption: `🎵 ${videoTitle}`,
          contextInfo: {
            isForwarded: false,
            forwardingScore: 999,
            externalAdReply: {
              title: "✨ YouTube Audio Downloader ✨",
              body: "Enjoy your music!",
              thumbnailUrl: thumbnailUrl,
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
