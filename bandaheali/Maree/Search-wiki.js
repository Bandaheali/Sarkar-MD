import fetch from 'node-fetch';
import config from '../../config.cjs';

const wikiSearch = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "wiki") {
    const query = m.body.slice(prefix.length + cmd.length).trim();
    if (!query) {
      return sock.sendMessage(m.from, { text: "⚠️ براہ کرم تلاش کے لیے کوئی عبارت درج کریں!" }, { quoted: m });
    }

    const url = `https://bk9.fun/search/wiki?q=${encodeURIComponent(query)}`;

    try {
      let sentMsg = await sock.sendMessage(m.from, { text: "🔍 تلاش کی جا رہی ہے..." }, { quoted: m });

      const response = await fetch(url);
      const data = await response.json();

      if (!data.BK9 || data.BK9.length === 0) {
        return sock.sendMessage(m.from, { edit: sentMsg.key, text: "❌ کوئی نتیجہ نہیں ملا!" });
      }

      const result = data.BK9[0];
      const message = `📖 *${query}*\n🔗 [مزید پڑھیں](https://bk9.fun/search/wiki?q=${encodeURIComponent(query)})`;

      await sock.sendMessage(m.from, { edit: sentMsg.key, text: message });

    } catch (error) {
      console.error(error);
      await sock.sendMessage(m.from, { text: "❌ خرابی پیش آئی، براہ کرم دوبارہ کوشش کریں!" }, { quoted: m });
    }
  }
};

export default wikiSearch;
