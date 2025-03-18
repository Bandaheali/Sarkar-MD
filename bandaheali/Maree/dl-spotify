import axios from "axios";
import config from "../../config.cjs";

const spotify = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "spotify") {
    if (!text) {
      return sock.sendMessage(m.from, {
        text: "*❌ Please provide a Spotify track link.*\n\n📌 *Example:* .spotify https://open.spotify.com/track/xyz",
      }, { quoted: m });
    }

    const api = `https://apis.giftedtech.web.id/api/download/spotifydl?apikey=gifted&url=${encodeURIComponent(text)}`;

    await sock.sendMessage(m.from, {
      text: "🔄 *Fetching Spotify track...*",
    }, { quoted: m });

    try {
      const response = await axios.get(api);
      const { success, result } = response.data;

      if (!success || !result.download_url) {
        return sock.sendMessage(m.from, {
          text: "*❌ Failed to retrieve the song. The API may be down or the link is invalid.*",
        }, { quoted: m });
      }

      await sock.sendMessage(m.from, {
        audio: { url: result.download_url },
        mimetype: "audio/mp3",
        ptt: false,
        fileName: `${result.title}.mp3`,
        caption: `🎶 *Song:* ${result.title}\n⏳ *Duration:* ${result.duration}\n🔊 *Quality:* ${result.quality}`,
      }, { quoted: m });

    } catch (error) {
      console.error(error);
      return sock.sendMessage(m.from, {
        text: "*❌ An error occurred while processing your request. Please try again later.*",
      }, { quoted: m });
    }
  }
};

export default spotify;
