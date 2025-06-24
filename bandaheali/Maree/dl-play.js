import yts from 'yt-search';
import config from '../../config.js';
import axios from 'axios';

// Ultra-fast API Configuration with fallbacks
const APIS = [
  {
    name: "ExonityTech",
    url: (url) => `https://exonity.tech/api/ytdl-download?url=${encodeURIComponent(url)}&type=audio`,
    getUrl: (data) => data?.data?.url,
    timeout: 3000,  // Faster timeout
    axiosConfig: { maxRedirects: 5 }
  },
  {
    name: "Asepharyana",
    url: (url) => `https://apidl.asepharyana.cloud/api/downloader/ytmp3?url=${encodeURIComponent(url)}`,
    getUrl: (data) => data?.url,
    timeout: 4000,
    axiosConfig: { maxRedirects: 5 }
  },
  {
    name: "FastYTDL",
    url: (url) => `https://ytdl.sarkar-md.tech/api/download?url=${encodeURIComponent(url)}&format=mp3`,
    getUrl: (data) => data?.url,
    timeout: 3500,
    axiosConfig: { maxRedirects: 5 }
  }
];

// Global request counter for load balancing
let requestCounter = 0;

const dlplay = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.slice(prefix.length).split(' ')[0].toLowerCase();
  const query = m.body.slice(prefix.length + cmd.length).trim();

  if (!["play", "sarkar"].includes(cmd)) return;

  if (!query) {
    return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
  }

  // Immediate reaction for better UX
  await Promise.all([
    m.React('⏳'),
    sock.sendPresenceUpdate('composing', m.from)
  ]);

  try {
    // Ultra-fast video info lookup with parallel fallback
    const videoInfo = await Promise.race([
      getVideoInfo(query),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Search timeout')), 5000))
    ]);

    // Load balancing - rotate through APIs
    requestCounter++;
    const apiIndex = requestCounter % APIS.length;
    const prioritizedApis = [
      APIS[apiIndex],  // Primary API (rotated)
      ...APIS.filter((_, i) => i !== apiIndex)  // Others as fallbacks
    ];

    // Blazing-fast parallel download attempts
    const audioUrl = await Promise.race([
      tryApisUltraFast(prioritizedApis, videoInfo.url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Download timeout (5s)')), 5000))
    ]);

    if (!audioUrl) throw new Error("No working downloader available");

    // Stream the audio while preparing metadata
    await Promise.all([
      m.React('✅'),
      sendUltraFastAudio(sock, m, {
        audioUrl,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        url: videoInfo.url
      })
    ]);

  } catch (error) {
    console.error("Error:", error);
    await Promise.all([
      m.React('❌'),
      sock.sendMessage(m.from, { 
        text: `❌ Failed to process!\n${error.message}\n\nTry again or use a different query.` 
      }, { quoted: m })
    ]);
  } finally {
    await sock.sendPresenceUpdate('paused', m.from);
  }
};

// Lightning-fast video info fetcher
async function getVideoInfo(query) {
  const isUrl = query.match(/youtube\.com|youtu\.be/);
  const vid = isUrl ? (query.match(/[?&]v=([^&]+)/)?.[1] || query.split('/').pop() : null;
  
  if (isUrl) {
    const url = query.includes('://') ? query : `https://${query}`;
    return {
      url,
      title: "YouTube Audio",  // Default title for speed
      thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`
    };
  }

  // Parallel search with timeout
  const results = await Promise.race([
    yts(query),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Search timeout')), 4000))
  ]);

  if (!results.videos.length) throw new Error("No results found");
  return {
    url: results.videos[0].url,
    title: results.videos[0].title,
    thumbnail: results.videos[0].thumbnail
  };
}

// Ultra-fast API trying with immediate failures
async function tryApisUltraFast(apis, videoUrl) {
  const controller = new AbortController();
  
  const apiPromises = apis.map(api => 
    Promise.race([
      fetchApiUltraFast(api, videoUrl, controller.signal),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`${api.name} timeout`)), api.timeout)
      )
    ])
    .catch(e => null)  // Silent fail for individual APIs
  );

  // Return the first successful response
  const results = await Promise.all(apiPromises);
  controller.abort();  // Cancel all pending requests
  
  return results.find(url => url) || null;
}

// Ultra-fast fetching with axios and proper cleanup
async function fetchApiUltraFast(api, videoUrl, signal) {
  try {
    const response = await axios.get(api.url(videoUrl), {
      timeout: api.timeout,
      signal,
      ...api.axiosConfig
    });
    
    const audioUrl = api.getUrl(response.data);
    if (!audioUrl) throw new Error("Invalid response format");
    
    console.log(`⚡ ${api.name} success in ${response.duration}ms`);
    return audioUrl;
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error(`🚫 ${api.name} failed:`, e.message);
    }
    throw e;
  }
}

// Stream-optimized audio sending
async function sendUltraFastAudio(sock, m, { audioUrl, title, thumbnail, url }) {
  // Start streaming immediately while preparing metadata
  const messagePromise = sock.sendMessage(
    m.from,
    {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      ptt: false,
      fileName: `${title.substring(0, 36)}.mp3`,  // Shorter filename
      contextInfo: {
        externalAdReply: {
          title: "⚡ Instant Audio Delivery ⚡",
          body: title.length > 20 ? `${title.substring(0, 20)}...` : title,
          thumbnailUrl: thumbnail,
          sourceUrl: url,
          mediaType: 1
        }
      }
    },
    { quoted: m }
  );

  // Send caption separately for faster appearance
  const captionPromise = sock.sendMessage(
    m.from,
    { text: `🎧 *${title}*\n⬇️ Instant download via @Sarkar-MD` },
    { quoted: m }
  );

  await Promise.race([messagePromise, captionPromise]);
}

export default dlplay;
