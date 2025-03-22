import config from '../../config.cjs';
import yts from 'yt-search';

const ytSearch = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const query = m.body.slice(prefix.length + cmd.length).trim();

  if (["ytsearch", "yts", "searchyt"].includes(cmd)) {
    if (!query) {
      return await sock.sendMessage(m.from, { text: "> *Please provide a search query!*" }, { quoted: m });
    }

    await m.React('⏳'); // React with a loading icon

    try {
      const searchResults = await yts(query);
      const videos = searchResults.videos.slice(0, 10); // Sending only top 10 results

      if (videos.length === 0) {
        await m.React('❌'); // React with an error icon
        return await sock.sendMessage(m.from, { text: "> *No results found!*" }, { quoted: m });
      }

      let message = `> *🔍 YouTube Search Results for:* _"${query}"_\n\n`;

      videos.forEach((video, index) => {
        message += `*${index + 1}. ${video.title}*\n`;
        message += `📌 *Channel:* ${video.author.name}\n`;
        message += `⏳ *Duration:* ${video.timestamp}\n`;
        message += `🔗 *Link:* ${video.url}\n\n𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐒𝐀𝐑𝐊𝐀𝐑-𝐌𝐃`;
      });

      await sock.sendMessage(
        m.from,
        {
          text: message,
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999,
            externalAdReply: {
              title: "✨ Sarkar-MD YouTube Search ✨",
              body: "Find and Watch YouTube Videos",
              thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
              sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork',
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        },
        { quoted: m }
      );

      await m.React('✅'); // React with success icon
    } catch (error) {
      console.error(error);
      await m.React('❌');
      await sock.sendMessage(m.from, { text: "> *Error fetching search results!*" }, { quoted: m });
    }
  }
};

export default ytSearch;
