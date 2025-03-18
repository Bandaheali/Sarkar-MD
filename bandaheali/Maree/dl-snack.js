import axios from "axios";
import config from "../../config.cjs";

const snack = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "snack") {
    if (!text) {
      return sock.sendMessage(m.from, {
        text: "*❌ Please provide a SnackVideo link.*\n\n📌 *Example:* .snack https://www.snackvideo.com/@user/video/123456",
      }, { quoted: m });
    }

    const api = `https://apis.giftedtech.web.id/api/download/snackdl?apikey=gifted&url=${encodeURIComponent(text)}`;

    await sock.sendMessage(m.from, {
      text: "🔄 *Fetching SnackVideo...*",
    }, { quoted: m });

    try {
      const response = await axios.get(api);
      const { success, result } = response.data;

      if (!success || !result.media) {
        return sock.sendMessage(m.from, {
          text: "*❌ Failed to retrieve the video. The API may be down or the link is invalid.*",
        }, { quoted: m });
      }

      await sock.sendMessage(m.from, {
        video: { url: result.media },
        caption: `🎥 *SnackVideo Downloaded!*\n👤 *Author:* ${result.author}\n❤️ *Likes:* ${result.like}\n💬 *Comments:* ${result.comment}\n🔄 *Shares:* ${result.share}`,
      }, { quoted: m });

    } catch (error) {
      console.error(error);
      return sock.sendMessage(m.from, {
        text: "*❌ An error occurred while processing your request. Please try again later.*",
      }, { quoted: m });
    }
  }
};

export default snack;
