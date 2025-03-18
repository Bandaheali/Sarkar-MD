import axios from "axios";
import config from "../../config.cjs";

const twitter = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "twitter" || cmd === "tweet") {
    if (!text) {
      return sock.sendMessage(m.from, {
        text: "*❌ Please provide a Twitter link.*\n\n📌 *Example:* .twitter https://twitter.com/example/status/123456",
      }, { quoted: m });
    }

    const api = `https://api.paxsenix.biz.id/dl/twitter?url=${encodeURIComponent(text)}`;

    await sock.sendMessage(m.from, {
      text: "🔄 *Fetching Twitter media...*",
    }, { quoted: m });

    try {
      const response = await axios.get(api);
      const { ok, desc, HD, SD, audio } = response.data;

      if (!ok) {
        return sock.sendMessage(m.from, {
          text: "*❌ Failed to retrieve the media. The API may be down or the link is invalid.*",
        }, { quoted: m });
      }

      if (HD) {
        await sock.sendMessage(m.from, {
          video: { url: HD },
          caption: "🎥 *Twitter Video (HD)*",
        }, { quoted: m });
      } else if (SD) {
        await sock.sendMessage(m.from, {
          video: { url: SD },
          caption: "🎥 *Twitter Video (SD)*",
        }, { quoted: m });
      } else if (audio) {
        await sock.sendMessage(m.from, {
          audio: { url: audio },
          mimetype: "audio/mp4",
          caption: "🎵 *Twitter Audio*",
        }, { quoted: m });
      } else {
        await sock.sendMessage(m.from, {
          text: "*❌ No media found in this link.*",
        }, { quoted: m });
      }

    } catch (error) {
      console.error(error);
      return sock.sendMessage(m.from, {
        text: "*❌ An error occurred while processing your request. Please try again later.*",
      }, { quoted: m });
    }
  }
};

export default twitter;
