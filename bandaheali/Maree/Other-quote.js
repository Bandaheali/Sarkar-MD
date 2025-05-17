import config from '../../config.js';
import axios from 'axios'; // You'll need to install axios if not already present

const quote = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "quote") {
    try {
      await m.React('⏳'); // React with loading icon
      
      // Fetch quote from API
      const response = await axios.get('https://zenquotes.io/api/random');
      const quoteData = response.data[0];
      
      const formattedQuote = `
📌 *Quote of the Day* 📌

${quoteData.q}

_— ${quoteData.a}_
      `;

      await m.React('✅'); // React with success icon

      sock.sendMessage(
        m.from,
        {
          text: formattedQuote,
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363315182578784@newsletter',
              newsletterName: "Sarkar-MD",
              serverMessageId: -1,
            },
            forwardingScore: 999,
            externalAdReply: {
              title: "✨ Sarkar-MD ✨",
              body: "Daily Wisdom",
              thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
              sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork',
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        },
        { quoted: m }
      );
    } catch (error) {
      console.error('Error fetching quote:', error);
      await m.React('❌'); // React with error icon
      sock.sendMessage(
        m.from,
        { text: '⚠️ Failed to fetch quote. Please try again later.' },
        { quoted: m }
      );
    }
  }
};

export default quote;
