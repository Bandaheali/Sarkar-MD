import config from '../../config.cjs';
import axios from 'axios';

const apiKey = '22c1d064-1a8e-4b5b-94dd-23df8221b2a0';

const cricketScore = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['score', 'crick', 'crickterscore', 'cricket'];

  if (validCommands.includes(cmd)) {
    if (!text) {
      await m.React("❌");
      return m.reply(`*Provide a match ID for cricket score.*\nExample: ${prefix}cricket 00000000-xxxx-yyyy-zzzz-abcdef123456`);
    }

    const matchId = text;

    try {
      const url = `https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`;
      const res = await axios.get(url);
      const matches = res.data?.data;

      const match = matches?.find(m => m.id === matchId);

      if (!match) {
        await m.React("❌");
        return m.reply(`❌ *Match ID not found or not live.*`);
      }

      let formatted = `╭══════════════•∞•══╮\n`;
      formatted += `│⿻   *Sarkar-MD*\n`;
      formatted += `│⿻   *LIVE MATCH INFO* ✨\n│⿻\n`;
      formatted += `│⿻   *${match.name}*\n`;
      formatted += `│⿻   *Status:* ${match.status}\n`;

      if (match.score && match.score.length > 0) {
        for (const s of match.score) {
          formatted += `│⿻   *${s.inning}*\n`;
          formatted += `│⿻   Runs: ${s.runs}/${s.wickets} (${s.overs} ov)\n│⿻\n`;
        }
      } else {
        formatted += `│⿻   Score data not available.\n`;
      }

      formatted += `╰══•∞•═══════════════╯`;

      await m.reply(formatted);
      await m.React("✅");
    } catch (e) {
      await m.React("❌");
      console.error("Error:", e.message);
      return m.reply(`❌ *Error fetching cricket score.*\n${e.message}`);
    }
  }
};

export default cricketScore;
