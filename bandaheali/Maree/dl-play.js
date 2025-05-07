import config from '../../config.cjs';

const dlSong = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "play" || cmd === "yta") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
    }

    await m.React('⏳'); // Loading reaction

    try {
      const apiUrl = `https://common-evangelina-mrshabankha-b7051a83.koyeb.app/yta?q=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!result || !result.download_url) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch song!" }, { quoted: m });
      }

      const { title, download_url, thumbnail } = result;

      await m.React('✅'); // Success reaction

      await sock.sendMessage(
        m.from,
        {
          audio: { url: download_url },
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${title}.mp3`,
          caption: `🎵 *Title:* ${title}\n📥 *Downloaded from:* Sarkar-MD\n\nPOWERED BY BANDAHEALI`,
          contextInfo: {
            isForwarded: false,
            forwardingScore: 999,
            externalAdReply: {
              title: "✨ Sarkar-MD ✨",
              body: "YouTube Audio Downloader",
              thumbnailUrl: thumbnail,
              sourceUrl: apiUrl,
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in dlSong command:", error);
      sock.sendMessage(m.from, { text: "❌ An error occurred while processing your request!" }, { quoted: m });
    }
  }
};

export default dlSong;
