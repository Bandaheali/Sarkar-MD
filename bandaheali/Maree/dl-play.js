// Trial Number 23 Alhamdulillah Success✅️


import yts from 'yt-search';
import config from '../../config.js';
import axios from 'axios';

// Reliable API Configuration with fallbacks
const APIS = [
  {
    name: "Temp",
    url: (url) => `https://y2mate-api.sarkar-md.tech/api/ytmp3?id=${extractVideoId(url)}`,
    getUrl: (data) => data?.result?.url || data?.url,
    timeout: 5000,
    axiosConfig: { maxRedirects: 3 }
  },
  {
    name: "Fastest",
    url: (url) => `https://exonity.tech/api/ytdl-download?url=${encodeURIComponent(url)}&type=audio`,
    getUrl: (data) => data?.data?.url,
    timeout: 5000,
    axiosConfig: { maxRedirects: 3 }
  },
  {
    name: "Faster",
    url: (url) => `https://apidl.asepharyana.cloud/api/downloader/ytmp3?url=${encodeURIComponent(url)}`,
    getUrl: (data) => data?.url,
    timeout: 5000,
    axiosConfig: { maxRedirects: 3 }
  }
];

function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const dlplay = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.slice(prefix.length).split(' ')[0].toLowerCase();
  const query = m.body.slice(prefix.length + cmd.length).trim();

  if (!["play", "sarkar"].includes(cmd)) return;

  if (!query) {
    return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
  }

  await m.React('⏳');

  try {
    // Get video info with fallback
    const videoInfo = await getVideoInfoWithFallback(query);
    
    // Try all APIs sequentially with proper error handling
    const audioUrl = await tryApisSequentially(videoInfo.url);
    
    if (!audioUrl) {
      throw new Error("All download services are currently unavailable. Please try again later.");
    }

    await m.React('✅');
    
    // Send audio with proper error handling
    await sendAudioWithRetry(sock, m, {
      audioUrl,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      url: videoInfo.url
    });

  } catch (error) {
    console.error("Error:", error);
    await m.React('❌');
    await sock.sendMessage(m.from, { 
      text: `❌ Error: ${error.message}\n\nTry again or use a different query.` 
    }, { quoted: m });
  }
};

async function getVideoInfoWithFallback(query) {
  try {
    if (query.match(/youtube\.com|youtu\.be/)) {
      const vid = extractVideoId(query);
      if (!vid) throw new Error("Invalid YouTube URL");
      
      const url = query.includes('://') ? query : `https://${query}`;
      const info = await yts({ videoId: vid });
      
      return {
        url,
        title: info.title || "YouTube Audio",
        thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`
      };
    }

    const results = await yts(query);
    if (!results.videos.length) throw new Error("No results found");
    
    return {
      url: results.videos[0].url,
      title: results.videos[0].title,
      thumbnail: results.videos[0].thumbnail
    };
  } catch (error) {
    console.error("Video info error:", error);
    throw new Error("Couldn't get video information. Please check your query.");
  }
}

async function tryApisSequentially(videoUrl) {
  for (const api of APIS) {
    try {
      console.log(`Trying ${api.name}...`);
      const audioUrl = await fetchApiWithRetry(api, videoUrl);
      if (audioUrl) {
        console.log(`Success with ${api.name}`);
        return audioUrl;
      }
    } catch (error) {
      console.error(`${api.name} failed:`, error.message);
    }
  }
  return null;
}

async function fetchApiWithRetry(api, videoUrl, retries = 2) {
  try {
    const response = await axios.get(api.url(videoUrl), {
      timeout: api.timeout,
      ...api.axiosConfig
    });
    
    const audioUrl = api.getUrl(response.data);
    if (!audioUrl) throw new Error("Invalid response format");
    
    return audioUrl;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying ${api.name}... (${retries} left)`);
      return fetchApiWithRetry(api, videoUrl, retries - 1);
    }
    throw error;
  }
}

async function sendAudioWithRetry(sock, m, { audioUrl, title, thumbnail, url }, retries = 2) {
  try {
    await sock.sendMessage(
      m.from,
      {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${cleanFilename(title)}.mp3`,
        caption: `🎵 *${title}*\n⬇️ Downloaded via @Sarkar-MD`,
        contextInfo: {
          externalAdReply: {
            title: "⚡ Instant Audio Downloader ⚡",
            body: "Sarkar-MD",
            thumbnailUrl: thumbnail,
            sourceUrl: url,
            mediaType: 1
          }
        }
      },
      { quoted: m }
    );
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying audio send... (${retries} left)`);
      return sendAudioWithRetry(sock, m, { audioUrl, title, thumbnail, url }, retries - 1);
    }
    throw new Error("Failed to send audio after multiple attempts");
  }
}

function cleanFilename(str) {
  return str.replace(/[^\w\s.-]/gi, '').substring(0, 50);
}

function truncate(str, n) {
  return str.length > n ? str.substring(0, n) + "..." : str;
}

export default dlplay;
