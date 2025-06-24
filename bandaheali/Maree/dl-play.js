import yts from 'yt-search';
import config from '../../config.js';

// Optimized API Configuration with priority-based APIs
const APIS = [
  // 1st API - Neoxr (NEW - HIGHEST PRIORITY)
  {
    name: 'Neoxr-Fastest',
    url: (url) => `https://exonity.tech/api/ytdl-download?url=${encodeURIComponent(url)}&type=audio`,
    getUrl: (data) => data.status ? data.data.url : null,
    timeout: 3000  // Shortest timeout for highest priority
  },
  
  // 2nd API - Bandaheali
  {
    name: 'Bandaheali-Faster',
    url: (url) => `https://apis.bandaheali.site/api/ytmp3dl?url=${encodeURIComponent(url)}`,
    getUrl: (data) => data.success ? data.data.url : null,
    timeout: 4000
  },
  
  // 3rd API - Asepharyana
  {
    name: 'Asepharyana-Fast',
    url: (url) => `https://apidl.asepharyana.cloud/api/downloader/ytmp3?url=${encodeURIComponent(url)}`,
    getUrl: (data) => data.url || null,
    timeout: 5000
  },
  
  // 4th API - David Cyril
  {
    name: 'DavidCyril-Medium',
    url: (url) => `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(url)}`,
    getUrl: (data) => data.success ? data.result.download_url : null,
    timeout: 6000
  },
  
  // 5th API - Nexoracle
  {
    name: 'Nexoracle-Normal',
    url: (url) => `https://api.nexoracle.com/downloader/yt-audio2?apikey=sarkar_786&url=${encodeURIComponent(url)}`,
    getUrl: (data) => data.status === 200 ? data.result.audio : null,
    timeout: 7000
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

    // Parallel API requests with priority-based timeout
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
      text: `❌ Failed to download audio!\nError: ${error.message}\n\nPlease try again later or use a different song.` 
    }, { quoted: m });
  }
};

// Helper Functions
async function getVideoInfo(query) {
  if (query.match(/youtube\.com|youtu\.be/)) {
    const vid = query.match(/[?&]v=([^&]+)/)?.[1] || query.split('/').pop();
    const url = query.includes('://') ? query : `https://${query}`;
    
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
      fileName: `${title.substring(0, 50).replace(/[^\w\s.-]/gi, '')}.mp3`, // Sanitize filename
      caption: `🎵 *${title}*\n⬇️ *Downloaded via Sarkar-MD*\n🔗 ${url}`,
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
