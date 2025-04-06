import yts from 'yt-search';
import config from '../../config.cjs';

const dlplay = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body.trim();
  const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0] : '';
  const text = body.slice(prefix.length + cmd.length).trim();

  if (cmd !== "play" || cmd !== "dlplay") return;

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
      if (!videos.length) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }
      videoUrl = videos[0].url;
      videoTitle = videos[0].title;
      videoThumb = videos[0].thumbnail;
    }

    // Using Sparky API endpoint
    const apiUrl = `https://api.sparky.biz.id/api/downloader/song?search=${encodeURIComponent(videoUrl)}`;
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result.status || !result.data || !result.data.dl) {
      return sock.sendMessage(m.from, { text: "❌ Failed to fetch download link!" }, { quoted: m });
    }

    const { title, dl } = result.data;
    await m.React('✅');

    sock.sendMessage(
      m.from,
      {
        audio: { url: dl },
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${title}.mp3`,
        caption: `🎵 *Title:* ${title}\n📥 *Powered by SPARKY API*`,
        contextInfo: {
          isForwarded: false,
          forwardingScore: 999,
          externalAdReply: {
            title: "✨ YouTube Audio Downloader ✨",
            body: "High quality audio downloads",
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
    console.error("Error in dlSong command:", error);
    await m.React('❌');
    sock.sendMessage(m.from, { 
      text: "❌ An error occurred while processing your request!" 
    }, { quoted: m });
  }
};

export default dlplay;
