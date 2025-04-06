import yts from 'yt-search';
import config from '../../config.cjs';

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

const dlSong = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body.trim();
  const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0] : '';
  const text = body.slice(prefix.length + cmd.length).trim();

  if (cmd !== "song" && cmd !== "yta") return;

  if (!text) {
    return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
  }

  await m.React('⏳');

  try {
    let videoUrl = '';
    let videoTitle = '';
    let videoThumb = '';

    if (text.includes("youtube.com") || text.includes("youtu.be")) {
      videoUrl = text;
    } else {
      const { videos } = await yts(text);
      const validVideo = videos.find(v => !v.live && !v.upcoming && v.seconds < 600); // Max 10 min, not live
      if (!validVideo) {
        return sock.sendMessage(m.from, { text: "❌ No valid videos found!" }, { quoted: m });
      }
      videoUrl = validVideo.url;
      videoTitle = validVideo.title;
      videoThumb = validVideo.thumbnail;
    }

    const apiUrl = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`;
    const response = await fetchWithTimeout(apiUrl);
    const result = await response.json();

    if (!result.status || !result.result?.downloadUrl) {
      return sock.sendMessage(m.from, { text: "❌ Failed to fetch download link!" }, { quoted: m });
    }

    const { title, downloadUrl, quality } = result.result;

    await m.React('✅');

    sock.sendMessage(
      m.from,
      {
        audio: { url: downloadUrl },
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${title}.mp3`,
        caption: `🎵 *Title:* ${title}\n🎚️ *Quality:* ${quality}\n📥 *Downloaded from:* Sarkar-MD\n\nPOWERED BY BANDAHEALI`,
        contextInfo: {
          isForwarded: false,
          forwardingScore: 999,
          externalAdReply: {
            title: "✨ Sarkar-MD ✨",
            body: "YouTube Audio Downloader",
            thumbnailUrl: videoThumb || null,
            sourceUrl: videoUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
  } catch (error) {
    console.error("Error in dlSong:", error);
    await m.React('❌');
    sock.sendMessage(m.from, { text: "❌ Something went wrong! Try another song or link." }, { quoted: m });
  }
};

export default dlSong;
