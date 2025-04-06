import yts from 'yt-search';
import config from '../../config.cjs';
import axios from 'axios';

const dlSong = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "song" || cmd === "yta") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
    }

    await m.React('⏳');

    try {
      // Cache for repeated requests
      const cacheKey = `song:${text.toLowerCase()}`;
      const cachedResult = global.cache?.get(cacheKey);
      
      if (cachedResult) {
        await m.React('✅');
        return sock.sendMessage(m.from, cachedResult, { quoted: m });
      }

      // Search with timeout
      const searchResults = await Promise.race([
        yts(text),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Search timeout')), 10000))
      ]);

      if (!searchResults.videos.length) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;

      // Using multiple API endpoints as fallback
      const apiEndpoints = [
        `https://apis.giftedtech.web.id/api/download/ytmp3?apikey=gifted&url=${videoUrl}`,
        `https://api.erdwpe.com/api/downloader/youtube?url=${videoUrl}`,
        `https://api.lolhuman.xyz/api/ytaudio2?apikey=${config.LOLHUMAN_APIKEY}&url=${videoUrl}`
      ];

      let result;
      for (const endpoint of apiEndpoints) {
        try {
          const response = await axios.get(endpoint, { timeout: 8000 });
          if (response.data?.result?.download_url) {
            result = response.data;
            break;
          }
        } catch (e) {
          console.log(`Failed with endpoint ${endpoint}`);
        }
      }

      if (!result?.result?.download_url) {
        return sock.sendMessage(m.from, { text: "❌ All download services failed!" }, { quoted: m });
      }

      const { title, download_url, thumbnail, quality } = result.result;

      // Validate the download URL before sending
      try {
        await axios.head(download_url, { timeout: 5000 });
      } catch (e) {
        return sock.sendMessage(m.from, { text: "❌ Invalid download link!" }, { quoted: m });
      }

      await m.React('✅');

      const messagePayload = {
        audio: { url: download_url },
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${title.substring(0, 64)}.mp3`,
        caption: `🎵 *${title}*\n⚡ *Quality:* ${quality}\n\n_Powered by Sarkar-MD_`,
        contextInfo: {
          externalAdReply: {
            title: title.substring(0, 32),
            body: "High Quality Audio",
            thumbnailUrl: thumbnail,
            sourceUrl: videoUrl,
            mediaType: 1
          }
        }
      };

      // Cache the result for 1 hour
      if (global.cache) {
        global.cache.set(cacheKey, messagePayload, 3600);
      }

      sock.sendMessage(m.from, messagePayload, { quoted: m });

    } catch (error) {
      console.error("Error in dlSong:", error);
      sock.sendMessage(m.from, 
        { text: "❌ Failed to process. Please try a different song or try again later." }, 
        { quoted: m }
      );
      await m.React('❌');
    }
  }
};

export default dlSong;
