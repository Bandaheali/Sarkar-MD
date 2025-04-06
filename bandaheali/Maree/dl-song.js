import yts from 'yt-search';
import config from '../../config.cjs';

const dlSong = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();
  const pushName = m.pushName || "User";

  if (cmd === "song") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
    }

    await sock.sendMessage(m.from, {
      text: `*_Hello Mr_*. *${pushName}*, *_please wait..._*\n*_Sarkar-MD is downloading your query_*.`,
    }, { quoted: m });

    try {
      const searchResults = await yts(text);
      if (!searchResults.videos.length) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const video = searchResults.videos[0];
      const { title, url: videoUrl, views, timestamp, ago, thumbnail } = video;

      await sock.sendMessage(m.from, {
        image: { url: thumbnail },
        caption: `🎶 *Title:* ${title}\n📅 *Published:* ${ago}\n⏱️ *Duration:* ${timestamp}\n👁️ *Views:* ${views}\n\n*_Downloading audio..._*`,
      }, { quoted: m });

      const apiUrl = `https://api.siputzx.my.id/api/dl/youtube/mp3?url=${videoUrl}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!result.status || !result.data) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch download link!" }, { quoted: m });
      }

      const downloadUrl = result.data;

      await sock.sendMessage(m.from, {
        audio: { url: downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        ptt: false,
      }, { quoted: m });

    } catch (err) {
      console.error("Error in song command:", err);
      sock.sendMessage(m.from, { text: "❌ Soory To Download please Use song2 song3 or play command" }, { quoted: m });
    }
  }
};

export default dlSong;
