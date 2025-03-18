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

    // Send "Fetching" message and store it (so we can delete it later)
    const loadingMsg = await sock.sendMessage(m.from, {
      text: "🔄 *Fetching Spotify track...*",
    }, { quoted: m });

    try {
      const response = await axios.get(api);
      console.log("Spotify API Response:", response.data); // Debugging log

      if (!response.data.success || !response.data.result.download_url) {
        await sock.sendMessage(m.from, {
          text: "*❌ Failed to retrieve the song. The API may be down or the link is invalid.*",
        }, { quoted: m });
        return;
      }

      const { title, duration, quality, download_url } = response.data.result;

      // Delete fetching message (to clean UI)
      await sock.sendMessage(m.from, { delete: loadingMsg.key });

      await sock.sendMessage(m.from, {
        audio: { url: download_url },
        mimetype: "audio/mp3",
        ptt: false,
        fileName: `${title}.mp3`,
        caption: `🎶 *Song:* ${title}\n⏳ *Duration:* ${duration}\n🔊 *Quality:* ${quality}\n\n> *Powered by Sarkar-MD*`,
      }, { quoted: m });

    } catch (error) {
      console.error("Spotify API Error:", error);
      await sock.sendMessage(m.from, {
        text: "*❌ An error occurred while processing your request. Please try again later.*",
      }, { quoted: m });
    }
  }
};

export default spotify;
