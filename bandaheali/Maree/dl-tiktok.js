import axios from 'axios';
import config from '../../config.js';

// TikTok Downloader APIs with fallback system
const TIKTOK_APIS = [
  {
    name: "PaxSenix",
    url: (link) => `https://api.paxsenix.biz.id/dl/tiktok?url=${encodeURIComponent(link)}`,
    processor: (data) => {
      if (!data.ok) return null;
      return {
        videoUrl: data.downloadUrls.video,
        musicUrl: data.downloadUrls.music,
        author: data.detail.author,
        username: data.detail.authorUsername,
        description: data.detail.description,
        likes: data.detail.like,
        comments: data.detail.comment,
        shares: data.detail.share,
        views: data.detail.view,
        thumbnail: data.detail.cover
      };
    },
    timeout: 5000
  },
  {
    name: "DavidCyrilTech",
    url: (link) => `https://apis.davidcyriltech.my.id/download/tiktok?url=${encodeURIComponent(link)}`,
    processor: (data) => {
      if (!data.success) return null;
      return {
        videoUrl: data.result.video,
        musicUrl: data.result.music,
        author: data.result.author.nickname,
        username: data.result.author.nickname,
        description: data.result.desc,
        likes: data.result.statistics.likeCount,
        comments: data.result.statistics.commentCount,
        shares: data.result.statistics.shareCount,
        views: data.result.statistics.playCount,
        thumbnail: data.result.author.avatar
      };
    },
    timeout: 6000
  },
  {
    name: "DeliriusAPI",
    url: (link) => `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(link)}`,
    processor: (data) => {
      if (!data.status) return null;
      const video = data.data.meta.media.find(v => v.type === "video");
      const audio = data.data.meta.media.find(v => v.type === "audio");
      return {
        videoUrl: video.org,
        musicUrl: audio?.org,
        author: data.data.author.nickname,
        username: data.data.author.username,
        description: data.data.title,
        likes: data.data.like,
        comments: data.data.comment,
        shares: data.data.share,
        thumbnail: data.data.author.avatar
      };
    },
    timeout: 7000
  }
];

const tiktok = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (!["tiktok", "ttdl", "tt", "tiktokdl"].includes(cmd)) return;

  // Add loading reaction
  await m.React('🔄');

  const link = text.trim();
  if (!link) {
    await m.React('❌');
    return sendErrorMessage(m, sock, "*❌ Please provide a TikTok video link.*");
  }

  if (!link.includes("tiktok.com") && !link.includes("vt.tiktok.com")) {
    await m.React('❌');
    return sendErrorMessage(m, sock, "*❌ Invalid TikTok link. Please provide a valid TikTok URL.*");
  }

  try {
    // Send processing message
    await sock.sendPresenceUpdate('composing', m.from);
    await sock.sendMessage(m.from, { 
      text: "*🔄 Downloading your TikTok video...*",
      contextInfo: { forwardingScore: 999 } 
    }, { quoted: m });

    // Try all APIs sequentially until one succeeds
    const result = await tryAllTikTokApis(link);
    
    if (!result) {
      await m.React('❌');
      return sendErrorMessage(m, sock, "*❌ All download services failed. Please try again later.*");
    }

    const caption = generateCaption(result);
    
    // Send video with retry mechanism
    await sendVideoWithRetry(m, sock, result.videoUrl, caption);

    // Send audio if available
    if (result.musicUrl) {
      await sendAudioWithRetry(m, sock, result.musicUrl, `🔊 Audio from: ${result.description || 'TikTok video'}`);
    }

    // Success reaction
    await m.React('✅');

  } catch (error) {
    console.error("TikTok Download Error:", error);
    await m.React('❌');
    sendErrorMessage(m, sock, `*❌ Download failed: ${error.message}*`);
  } finally {
    await sock.sendPresenceUpdate('paused', m.from);
  }
};

// Helper Functions
async function tryAllTikTokApis(link) {
  for (const api of TIKTOK_APIS) {
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

function generateCaption(data) {
  return `🎵 *TikTok Download* 🎵\n\n` +
         `👤 *Author:* ${data.author} (@${data.username || 'N/A'})\n` +
         `📝 *Description:* ${data.description || 'No description'}\n` +
         `👍 *Likes:* ${data.likes || 'N/A'} | 💬 *Comments:* ${data.comments || 'N/A'}\n` +
         `🔁 *Shares:* ${data.shares || 'N/A'} | 👀 *Views:* ${data.views || 'N/A'}\n\n` +
         `⬇️ *Downloaded via Sarkar-MD*`;
}

async function sendVideoWithRetry(m, sock, videoUrl, caption, retries = 2) {
  try {
    await sock.sendMessage(
      m.from,
      {
        video: { url: videoUrl },
        caption: caption,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "⚡ TikTok Downloader ⚡",
            body: "Powered by Sarkar-MD",
            thumbnailUrl: "https://i.ibb.co/5KqYjbB/tiktok-icon.png",
            mediaType: 1
          }
        }
      },
      { quoted: m }
    );
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying video send... (${retries} left)`);
      return sendVideoWithRetry(m, sock, videoUrl, caption, retries - 1);
    }
    throw error;
  }
}

async function sendAudioWithRetry(m, sock, audioUrl, caption, retries = 2) {
  try {
    await sock.sendMessage(
      m.from,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        caption: caption,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999
        }
      },
      { quoted: m }
    );
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying audio send... (${retries} left)`);
      return sendAudioWithRetry(m, sock, audioUrl, caption, retries - 1);
    }
    console.error("Failed to send audio:", error.message);
  }
}

function sendErrorMessage(m, sock, message) {
  return sock.sendMessage(
    m.from,
    {
      text: message,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true
      }
    },
    { quoted: m }
  );
}

export default tiktok;
