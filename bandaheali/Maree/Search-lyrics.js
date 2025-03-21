import fetch from 'node-fetch';
import config from '../../config.cjs';

const lyricsSearch = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "lyrics") {
    const query = m.body.slice(prefix.length + cmd.length).trim();
    if (!query) {
      return sock.sendMessage(m.from, { text: "⚠️ Please provide a song name!" }, { quoted: m });
    }

    const url = `https://apis.giftedtech.web.id/api/search/lyricsv2?apikey=gifted-md&query=${encodeURIComponent(query)}`;

    try {
      let sentMsg = await sock.sendMessage(m.from, { text: "🎶 Searching for lyrics..." }, { quoted: m });

      const response = await fetch(url);
      const data = await response.json();

      if (!data.success || !data.result) {
        return sock.sendMessage(m.from, { edit: sentMsg.key, text: "❌ No lyrics found!" });
      }

      const lyrics = data.result.length > 4000 ? data.result.slice(0, 4000) + "...\n\n🔗 View full lyrics: " + url : data.result;

      await sock.sendMessage(m.from, { edit: sentMsg.key, text: `🎤 *Lyrics for ${query}:*\n\n${lyrics}` });

    } catch (error) {
      console.error(error);
      await sock.sendMessage(m.from, { text: "❌ An error occurred. Please try again later!" }, { quoted: m });
    }
  }
};

export default lyricsSearch;
