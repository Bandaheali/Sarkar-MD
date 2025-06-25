import axios from 'axios';
import config from '../../config.js';

// Facebook Downloader APIs with fallback system
const FB_APIS = [
  {
    name: 'Fastest',
    url: (link) => `https://apidl.asepharyana.cloud/api/downloader/fbdl?url=${encodeURIComponent(link)}`,
    processor: (data) => {
      if (!data?.status || !data.data) return null;
      return {
        sd: data.data.find(item => item.resolution.includes('SD'))?.url,
        hd: data.data.find(item => item.resolution.includes('HD') || item.resolution.includes('1080p'))?.url,
        thumb: data.data[0]?.thumbnail,
        title: data.data[0]?.title || 'Facebook Video'
      };
    },
    timeout: 5000
  },
  {
    name: 'Faster',
    url: (link) => `https://bk9.fun/download/fb?url=${encodeURIComponent(link)}`,
    processor: (data) => {
      if (!data?.status || !data.BK9) return null;
      return {
        sd: data.BK9.sd,
        hd: data.BK9.hd,
        thumb: data.BK9.thumb,
        title: data.BK9.title || 'Facebook Video'
      };
    },
    timeout: 6000
  },
  {
    name: 'Fast',
    url: (link) => `https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${encodeURIComponent(link)}`,
    processor: (data) => {
      if (!data?.status || !data.data) return null;
      return {
        sd: data.data.low,
        hd: data.data.high,
        thumb: data.data.thumbnail,
        title: data.data.title || 'Facebook Video'
      };
    },
    timeout: 7000
  }
];

const dlFb = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (!["fb", "fbdown"].includes(cmd)) return;

  // Add loading reaction
  await m.React('⏳');

  if (!text) {
    await m.React('❌');
    return sock.sendMessage(m.from, { 
      text: "❌ Please provide a Facebook video link!" 
    }, { quoted: m });
  }

  try {
    // Send processing message
    await sock.sendPresenceUpdate('composing', m.from);
    await sock.sendMessage(m.from, { 
      text: "🔄 Downloading your Facebook video..." 
    }, { quoted: m });

    // Try all APIs sequentially until one succeeds
    const result = await tryAllFacebookApis(text);
    
    if (!result) {
      await m.React('❌');
      return sock.sendMessage(m.from, { 
        text: "❌ All download services failed. Please try again later." 
      }, { quoted: m });
    }

    const videoUrl = result.hd || result.sd;
    const quality = result.hd ? "HD" : "SD";

    if (!videoUrl) {
      await m.React('❌');
      return sock.sendMessage(m.from, { 
        text: "❌ No downloadable video found!" 
      }, { quoted: m });
    }

    // Send video
    await sock.sendMessage(
      m.from,
      {
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption: `✅ *${quality} Video Downloaded!*\n📌 *Title:* ${result.title}\n\n*POWERED BY Sarkar-MD*`,
        contextInfo: {
          externalAdReply: {
            title: "✨ Sarkar-MD ✨",
            body: "Facebook Video Downloader",
            thumbnailUrl: result.thumb || 'https://i.ibb.co/5KqYjbB/facebook-icon.png',
            mediaType: 1,
          },
        },
      },
      { quoted: m }
    );

    // Success reaction
    await m.React('✅');

  } catch (error) {
    console.error("Error in fbdown command:", error);
    await m.React('❌');
    sock.sendMessage(m.from, { 
      text: `❌ Error: ${error.message}` 
    }, { quoted: m });
  } finally {
    await sock.sendPresenceUpdate('paused', m.from);
  }
};

// Helper Functions
async function tryAllFacebookApis(link) {
  for (const api of FB_APIS) {
    try {
      console.log(`Trying ${api.name} API...`);
      const response = await axios.get(api.url(link), { timeout: api.timeout });
      const result = api.processor(response.data);
      if (result) {
        console.log(`Success with ${api.name} API`);
        return result;
      }
    } catch (error) {
      console.error(`${api.name} API failed:`, error.message);
    }
  }
  return null;
}

export default dlFb;
