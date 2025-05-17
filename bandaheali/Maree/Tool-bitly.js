import axios from 'axios';
import config from '../../config.js';

const shorten = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === 'bitly') {
    const args = m.body.trim().split(' ').slice(1);
    const longUrl = args[0];

    if (!longUrl || !longUrl.startsWith('http')) {
      return await sock.sendMessage(
        m.from,
        { text: '*❌ Please provide a valid URL to shorten.*' },
        { quoted: m }
      );
    }

    await m.React('⏳');

    try {
      const res = await axios.post(
        'https://api-ssl.bitly.com/v4/shorten',
        { long_url: longUrl },
        {
          headers: {
            Authorization: `Bearer 33ac688f5ac4171e60ccfc9ca1661225ef12bbb4`,
            'Content-Type': 'application/json',
          },
        }
      );

      const shortUrl = res.data.link;

      await sock.sendMessage(
        m.from,
        {
          text: `> *Shortened URL:* ${shortUrl}`,
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363315182578784@newsletter',
              newsletterName: "Sarkar-MD",
              serverMessageId: -1,
            },
            externalAdReply: {
              title: "URL Shortener | Sarkar-MD",
              body: "VIP Bitly Shorten Service",
              thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
              sourceUrl: shortUrl,
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        },
        { quoted: m }
      );

      await m.React('✅');
    } catch (err) {
      console.error('Bitly Error:', err?.response?.data || err.message);
      await sock.sendMessage(
        m.from,
        { text: '*❌ Failed to shorten URL. Try again later.*' },
        { quoted: m }
      );
      await m.React('❌');
    }
  }
};

export default shorten;
