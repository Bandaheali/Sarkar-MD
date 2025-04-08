import axios from 'axios';
import config from '../../config.cjs';

const apiKey = '22c1d064-1a8e-4b5b-94dd-23df8221b2a0';

const liveScore = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["livescore", "score", "match"].includes(cmd)) {
    await m.React('⏳');

    try {
      const response = await axios.get('https://api.cricapi.com/v1/currentMatches', {
        params: {
          apikey: apiKey,
          offset: 0
        }
      });

      const matches = response.data.data;
      if (!matches || matches.length === 0) {
        await sock.sendMessage(m.from, { text: "*Koi live match nahi chal raha.*" }, { quoted: m });
        return;
      }

      const live = matches.slice(0, 3).map((match, i) => {
        const scores = match.score?.map(s => `${s.inning}: ${s.runs}/${s.wickets} in ${s.overs} ov`).join(' | ') || 'Score unavailable';
        return `*${i + 1}. ${match.name}*\n_Status:_ ${match.status}\n_Score:_ ${scores}`;
      }).join('\n\n');

      await sock.sendMessage(
        m.from,
        {
          text: `🏏 *LIVE CRICKET SCORES*\n\n${live}`,
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999,
            externalAdReply: {
              title: "Live Cricket Scores",
              body: "Powered by cricketdata.org",
              thumbnailUrl: 'https://i.imgur.com/YOUR_IMAGE.webp', // Replace with your image if you want
              sourceUrl: 'https://cricketdata.org/',
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        },
        { quoted: m }
      );

      await m.React('✅');

    } catch (err) {
      console.error("Score fetch error:", err.message);
      await sock.sendMessage(m.from, { text: "*Score fetch karte waqt error aaya.*" }, { quoted: m });
      await m.React('❌');
    }
  }
};

export default liveScore;
