import fetch from 'node-fetch';
import config from '../../config.js';

const movieCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'movie') {
      if (!query) {
        return m.reply(`*❌ Enter a movie or series name!*\nExample: ${prefix}movie deadpool`);
      }

      const api = `https://www.dark-yasiya-api.site/search/omdb?text=${encodeURIComponent(query)}`;
      const res = await fetch(api);
      const json = await res.json();

      if (!json.status || !json.result) {
        return m.reply(`❌ No results found for: *${query}*`);
      }

      const data = json.result;

      let ratings = '';
      if (data.Ratings && Array.isArray(data.Ratings)) {
        data.Ratings.forEach(r => {
          ratings += `┃ ${r.Source}: ${r.Value}\n`;
        });
      }

      const msg = `🎬 *${data.Title}* (${data.Year})
━━━━━━━━━━━━━━━
📅 Released: *${data.Released}*
⏱ Runtime: *${data.Runtime}*
🎭 Genre: *${data.Genre}*
🎬 Director: *${data.Director}*
✍️ Writer: *${data.Writer}*
🎭 Actors: *${data.Actors}*

📝 *Plot:* 
_${data.Plot}_

🌐 Language: *${data.Language}*
🏳️ Country: *${data.Country}*
🏆 Awards: *${data.Awards || 'None'}*
💵 Box Office: *${data.BoxOffice || 'N/A'}*

⭐ Ratings:
${ratings || 'N/A'}
━━━━━━━━━━━━━━━
📌 IMDB: ${data.imdbRating} | Votes: ${data.imdbVotes}
`;

      await sock.sendMessage(m.from, {
        image: { url: data.Poster },
        caption: msg,
      }, { quoted: m });
    }
  } catch (e) {
    console.error(e);
    m.reply('*❌ Error fetching movie data.*');
  }
};

export default movieCmd;
