import yts from 'yt-search';
import config from '../../config.js';

// Updated API Configuration with the new APIs
const APIS = [
  {
    name: "ExonityTech",
    url: (url) => `https://exonity.tech/api/ytdl-download?url=${encodeURIComponent(url)}&type=audio`,
    getUrl: (data) => data?.data?.url,
    timeout: 4000
  },
  {
    name: "Asepharyana",
    url: (url) => `https://apidl.asepharyana.cloud/api/downloader/ytmp3?url=${encodeURIComponent(url)}`,
    getUrl: (data) => data?.url,
    timeout: 5000
  }
];

// Cache with TTL (Time To Live)
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

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
    // Cache check with video URL as key for better cache hits
    const videoInfo = await getVideoInfo(query);
    const cacheKey = videoInfo.url.toLowerCase();
    
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        await sendAudioMessage(sock, m, cached.data);
        await m.React('✅');
        return;
      }
      cache.delete(cacheKey); // Remove expired cache
    }

    // Parallel API requests with race condition
    const audioUrl = await Promise.race([
      tryApisParallel(videoInfo.url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 8 seconds')), 8000))
    ]);

    if (!audioUrl) throw new Error("All Downloaders failed to respond in time");

    // Cache the result
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: {
        audioUrl,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        url: videoInfo.url
      }
    });

    await m.React('✅');
    await sendAudioMessage(sock, m, {
      audioUrl,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      url: videoInfo.url
    });

  } catch (error) {
    console.error("Error:", error);
    await m.React('❌');
    sock.sendMessage(m.from, { 
      text: `❌ Failed to download audio!\nError: ${error.message}` 
    }, { quoted: m });
  }
};

// Optimized Helper Functions
async function getVideoInfo(query) {
  if (query.match(/youtube\.com|youtu\.be/)) {
    const vid = query.match(/[?&]v=([^&]+)/)?.[1] || query.split('/').pop();
    const url = query.includes('://') ? query : `https://${query}`;
    
    // Try to get title from YouTube if possible
    try {
      const info = await yts({ videoId: vid });
      return {
        url,
        title: info.title || "YouTube Audio",
        thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`
      };
    } catch {
      return {
        url,
        title: "YouTube Audio",
        thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`
      };
    }
  }

  const results = await yts(query);
  if (!results.videos.length) throw new Error("No results found");
  const video = results.videos[0];
  return {
    url: video.url,
    title: video.title,
    thumbnail: video.thumbnail
  };
}

async function tryApisParallel(videoUrl) {
  const apiPromises = APIS.map(api => 
    Promise.race([
      fetchApi(api, videoUrl),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`API ${api.name} timeout`)), api.timeout)
      )
    ]).catch(e => {
      console.error(`${api.name} failed:`, e.message);
      return null;
    })
  );

  // Wait for the first successful response
  for (const promise of apiPromises) {
    try {
      const result = await promise;
      if (result) return result;
    } catch (e) {
      continue;
    }
  }
  return null;
}

async function fetchApi(api, videoUrl) {
  try {
    const res = await fetch(api.url(videoUrl));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const audioUrl = api.getUrl(data);
    if (!audioUrl) throw new Error("No download URL found");
    console.log(`✅ Success with ${api.name}`);
    return audioUrl;
  } catch (e) {
    console.error(`❌ ${api.name} error:`, e.message);
    throw e;
  }
}

async function sendAudioMessage(sock, m, { audioUrl, title, thumbnail, url }) {
  return sock.sendMessage(
    m.from,
    {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      ptt: false,
      fileName: `${title.substring(0, 50)}.mp3`, // Limit filename length
      caption: `🎵 *${title}*\n⬇️ *Downloaded via Sarkar-MD*`,
      contextInfo: {
        externalAdReply: {
          title: "⚡ Super-Fast Audio Downloader ⚡",
          body: "Powered by Sarkar-MD",
          thumbnailUrl: thumbnail,
          sourceUrl: url,
          mediaType: 1
        }
      }
    },
    { quoted: m }
  );
}

export default dlplay;
