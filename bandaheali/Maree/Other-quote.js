import axios from 'axios';

const quote = async (m, sock) => {
  const prefix = '.';
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "quote") {
    try {
      const response = await axios.get("https://api.quotable.io/random");
      const { content, author } = response.data;

      const message = `💬 *"${content}"*\n- _${author}_\n\n> *_QUOTES BY Sarkar-MD_*`;

      await sock.sendMessage(m.from, { text: message }, { quoted: m });

    } catch (error) {
      console.error("❌ Error fetching quote:", error);
      await sock.sendMessage(m.from, { text: "⚠️ API issue or coding error, please check the logs!" }, { quoted: m });
    }
  }
};

export default quote;
