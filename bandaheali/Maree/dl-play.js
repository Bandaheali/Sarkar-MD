import yts from 'yt-search';
import config from '../../config.js';

const dlplay = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "play" || cmd === "sarkar") {
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

      const video = searchResults.videos[0];
      const videoUrl = video.url;
      const title = video.title;
      const thumbnail = video.thumbnail;

      // Define all APIs with their response handlers
      const apis = [
        {
          url: `https://api.ahmmikun.live/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}&format=mp3`,
          handler: (data) => data?.result?.downloadUrl
        },
        {
          url: `https://fgsi1-restapi.hf.space/api/downloader/youtube/v1?url=${encodeURIComponent(videoUrl)}&format=mp3`,
          handler: (data) => data?.data?.download
        },
        {
          url: `https://api.giftedtech.my.id/api/download/ytmp3?apikey=gifted&url=${encodeURIComponent(videoUrl)}`,
          handler: (data) => data?.result?.download_url
        },
        {
          url: `https://linguistic-agneta-bandah-ealimaree-5e6480eb.koyeb.app/api/youtube/audio?url=${encodeURIComponent(videoUrl)}&apikey=Alphabot`,
          handler: (data) => data?.result?.audio
        }
      ];

      let audioUrl = null;
      let apiIndex = 0;

      // Try APIs sequentially until we get a valid audio URL
      while (!audioUrl && apiIndex < apis.length) {
        try {
          const api = apis[apiIndex];
          const response = await fetch(api.url);
          const data = await response.json();
          
          audioUrl = api.handler(data);
          
          if (audioUrl) {
            console.log(`Success with API ${apiIndex + 1}`);
            break;
          }
        } catch (error) {
          console.error(`API ${apiIndex + 1} failed:`, error);
        }
        apiIndex++;
      }

      if (!audioUrl) {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "❌ All download services failed!" }, { quoted: m });
      }

      await m.React('✅');

      // Send the audio file
      sock.sendMessage(
        m.from,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${title}.mp3`,
          caption: `🎵 *Title:* ${title}\n📥 *Downloaded via Multi-API System*`,
          contextInfo: {
            isForwarded: false,
            forwardingScore: 999,
            externalAdReply: {
              title: "✨ YouTube Audio Downloader ✨",
              body: "Powered by 4 API Fallback System",
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
      await m.React('❌');
      sock.sendMessage(m.from, { text: "❌ An error occurred while processing your request!" }, { quoted: m });
    }
  }
};

export default dlplay;
