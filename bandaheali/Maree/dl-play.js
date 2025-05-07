import yts from 'yt-search';
import config from '../../config.cjs';

const play = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "play") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
    }

    await m.React('⏳');

    try {
      const searchResults = await yts(text);
      if (!searchResults.videos.length) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;
      const title = video.title;
      const thumbnail = video.thumbnail;
      const ago = video.ago;

      // Inform user that download is in progress
      await sock.sendMessage(
        m.from,
        {
          image: { url: thumbnail },
          caption: `🎵 *Title:* ${title}\n *ago:* ${ago}\n *URl:* ${videoUrl}\n⌛ Please wait, downloading your query...\n\n_*POWERED BY ${config.BOT_NAME}*_`,
        },
        { quoted: m }
      );

      const apiUrl = `https://api.nexoracle.com/downloader/yt-audio2?apikey=free_key@maher_apis&url=${videoUrl}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status !== 200 || !data.result || !data.result.audio) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch audio link!" }, { quoted: m });
      }

      const { audio } = data.result;

      await m.React('✅');

      sock.sendMessage(
        m.from,
        {
          audio: { url: audio },
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${title}.mp3`,
          caption: `🎶 *Title:* ${title}\n📥 *Downloaded from:* ${config.BOT_NAME}\n\nPOWERED BY ${config.BOT_NAME}`,
          contextInfo: {
            isForwarded: false,
            forwardingScore: 999,
            externalAdReply: {
              title: `✨ ${config.BOT_NAME} ✨`,
              body: `NOW PLAYING ${title}`,
              sourceUrl: videoUrl,
              mediaType: 1,
            },
          },
        },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in play command:", error);
      sock.sendMessage(m.from, { text: "❌ An error occurred while processing your request!" }, { quoted: m });
    }
  }
};

export default play;
