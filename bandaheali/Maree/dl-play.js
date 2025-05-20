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

    await m.React('⏳'); // Loading reaction

    try {
      let videoUrl, title, thumbnail;

      // Check if input is a YouTube URL
      if (text.match(/(youtube\.com|youtu\.be)/i)) {
        // Extract clean URL (handle timestamps and extra parameters)
        videoUrl = text.split(/[&?]/)[0];
        // Use default thumbnail and title (will be updated by APIs)
        title = "YouTube Audio";
        thumbnail = "https://i.ytimg.com/vi/default.jpg";
      } else {
        // Search for video if it's not a URL
        const searchResults = await yts(text);
        if (!searchResults.videos.length) {
          await m.React('❌');
          return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
        }
        const video = searchResults.videos[0];
        videoUrl = video.url;
        title = video.title;
        thumbnail = video.thumbnail;
      }

      // Define all APIs with their response handlers
      const apis = [
        {
          name: "Ahmmikun API",
          url: `https://api.ahmmikun.live/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}&format=mp3`,
          handler: (data) => ({
            url: data?.result?.downloadUrl,
            title: data?.result?.title || title,
            thumb: data?.result?.image || thumbnail
          })
        },
        {
          name: "Fgsi API",
          url: `https://fgsi1-restapi.hf.space/api/downloader/youtube/v1?url=${encodeURIComponent(videoUrl)}&format=mp3`,
          handler: (data) => ({
            url: data?.data?.download,
            title: data?.data?.title || title,
            thumb: data?.data?.thumbnail || thumbnail
          })
        },
        {
          name: "GiftedTech API",
          url: `https://api.giftedtech.my.id/api/download/ytmp3?apikey=gifted&url=${encodeURIComponent(videoUrl)}`,
          handler: (data) => ({
            url: data?.result?.download_url,
            title: data?.result?.title || title,
            thumb: data?.result?.thumbnail || thumbnail
          })
        },
        {
          name: "Koyeb API",
          url: `https://linguistic-agneta-bandah-ealimaree-5e6480eb.koyeb.app/api/youtube/audio?url=${encodeURIComponent(videoUrl)}&apikey=Alphabot`,
          handler: (data) => ({
            url: data?.result?.audio,
            title: data?.result?.title || title,
            thumb: thumbnail // This API doesn't return thumbnail
          })
        }
      ];

      let result = null;
      let apiIndex = 0;

      // Try APIs sequentially
      while (!result?.url && apiIndex < apis.length) {
        try {
          console.log(`Trying ${apis[apiIndex].name}...`);
          const response = await fetch(apis[apiIndex].url);
          const data = await response.json();
          result = apis[apiIndex].handler(data);
          
          if (result.url) {
            // Update title and thumbnail from API if available
            title = result.title || title;
            thumbnail = result.thumb || thumbnail;
            console.log(`Success with ${apis[apiIndex].name}`);
            break;
          }
        } catch (error) {
          console.error(`${apis[apiIndex].name} failed:`, error);
        }
        apiIndex++;
      }

      if (!result?.url) {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "❌ All download services failed!" }, { quoted: m });
      }

      await m.React('✅');

      // Send the audio file
      sock.sendMessage(
        m.from,
        {
          audio: { url: result.url },
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`, // Remove special chars from filename
          caption: `🎵 *Title:* ${title}\n📥 *Downloaded via Multi-API System*`,
          contextInfo: {
            isForwarded: false,
            forwardingScore: 999,
            externalAdReply: {
              title: "✨ SARKAR-MD 🥰 ✨",
              body: "Powered by Sarkar-MD",
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
      sock.sendMessage(m.from, { text: `error occured ${error}` }, { quoted: m });
    }
  }
};

export default dlplay;
