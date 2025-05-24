import yts from 'yt-search';
import config from '../../config.js';

const dlvideo = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "video" || cmd === "sarkarvideo") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
    }

    await m.React('⏳'); // React with a loading icon

    try {
      let videoUrl, title, duration;

      // Check if input is a YouTube URL
      if (text.match(/(youtube\.com|youtu\.be)/i)) {
        // Directly use the provided URL
        videoUrl = text.includes('://') ? text : `https://${text}`;
        
        // Fetch video info without search
        const videoInfo = await yts({ videoId: getVideoId(videoUrl) });
        title = videoInfo.title;
        duration = videoInfo.duration;
      } else {
        // Search for the video using yt-search
        const searchResults = await yts(text);
        if (!searchResults.videos.length) {
          await m.React('❌');
          return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
        }

        const video = searchResults.videos[0];
        videoUrl = video.url;
        title = video.title;
        duration = video.duration;
      }

      // Define all video APIs with their response handlers
      const videoApis = [
        {
          url: `https://api.ahmmikun.live/api/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}&format=720`,
          handler: (data) => ({
            url: data?.result?.downloadUrl,
            quality: data?.result?.format || '720p'
          })
        },
        {
          url: `https://fgsi1-restapi.hf.space/api/downloader/youtube/v1?url=${encodeURIComponent(videoUrl)}&format=720`,
          handler: (data) => ({
            url: data?.data?.download,
            quality: data?.data?.quality || '720p'
          })
        },
        {
          url: `https://api.giftedtech.my.id/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(videoUrl)}`,
          handler: (data) => ({
            url: data?.result?.download_url,
            quality: data?.result?.quality || '480p'
          })
        }
      ];

      let videoData = null;
      let apiIndex = 0;

      // Try APIs sequentially until we get a valid video URL
      while (!videoData?.url && apiIndex < videoApis.length) {
        try {
          const api = videoApis[apiIndex];
          const response = await fetch(api.url);
          const data = await response.json();
          
          videoData = api.handler(data);
          
          if (videoData.url) {
            console.log(`Success with API ${apiIndex + 1}`);
            break;
          }
        } catch (error) {
          console.error(`API ${apiIndex + 1} failed:`, error);
        }
        apiIndex++;
      }

      if (!videoData?.url) {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "❌ All video download services failed!" }, { quoted: m });
      }

      await m.React('✅');

      // Send the video file with updated caption
      sock.sendMessage(
        m.from,
        {
          video: { url: videoData.url },
          mimetype: "video/mp4",
          caption: `📌 *${title}*\n\n⏱ Duration: ${duration}\n🔍 Quality: ${videoData.quality}\n\n⚡ Powered By ${config.BOT_NAME}\n💻 Keep Using Sarkar-MD`,
        },
        { quoted: m }
      );

    } catch (error) {
      console.error("Error in dlvideo command:", error);
      await m.React('❌');
      sock.sendMessage(m.from, { text: "❌ An error occurred while processing your request!" }, { quoted: m });
    }
  }
};

// Helper function to extract video ID from URL
function getVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default dlvideo;
