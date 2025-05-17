import config from '../../config.js';

const ytmp3 = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "ytmp3") {
    if (!text || !text.includes("youtube.com") && !text.includes("youtu.be")) {
      return sock.sendMessage(m.from, { text: "🔗 Please provide a valid YouTube link!" }, { quoted: m });
    }

    await m.React('⏳');

    try {
      const apiUrl = `https://ab-ytdl.abrahamdw882.workers.dev/?url=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!result.success || !result.data || !result.data.download) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch download link!" }, { quoted: m });
      }

      const { title, download } = result.data;
      const thumbnail = result.data.preview || '';

      await m.React('✅');

      sock.sendMessage(
        m.from,
        {
          audio: { url: download },
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${title}.mp3`,
          caption: `🎵 *Title:* ${title}\n📥 *Downloaded from:* YouTube\n\n*_POWERED BY Sarkar-MD_*`,
          contextInfo: {
            isForwarded: false,
            forwardingScore: 999,
            externalAdReply: {
              title: title,
              mediaType: 1,
              previewType: "VIDEO",
              thumbnailUrl: thumbnail,
              sourceUrl: text,
            },
          },
        },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in ytmp3 command:", error);
      sock.sendMessage(m.from, { text: "❌ An error occurred while processing your request!" }, { quoted: m });
    }
  }
};

export default ytmp3;
