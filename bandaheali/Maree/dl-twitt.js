import axios from "axios";
import config from "../../config.cjs";

const twitterDownloads = new Map(); // Store user requests

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
      const { ok, desc, thumb, HD, SD, audio } = response.data;

      if (!ok) {
        return sock.sendMessage(m.from, {
          text: "*❌ Failed to retrieve the media. The API may be down or the link is invalid.*",
        }, { quoted: m });
      }

      const caption = `🐦 *Twitter Media Found!*\n\n📝 *Description:* ${desc || "N/A"}\n\n📌 *Reply with:*\n\n1️⃣ *For HD Video*\n2️⃣ *For SD Video*\n3️⃣ *For Audio*\n\n> *Powered By Sarkar-MD*`;

      const msg = await sock.sendMessage(m.from, {
        image: { url: thumb },
        caption,
      }, { quoted: m });

      // Store user's media choice request
      twitterDownloads.set(m.from, { HD, SD, audio, msgId: msg.key.id });

    } catch (error) {
      console.error(error);
      return sock.sendMessage(m.from, {
        text: "*❌ An error occurred while processing your request. Please try again later.*",
      }, { quoted: m });
    }
  }

  // Handle user reply
  if (twitterDownloads.has(m.from)) {
    const userChoice = m.body.trim();
    const media = twitterDownloads.get(m.from);

    if (userChoice === "1") {
      await sock.sendMessage(m.from, {
        video: { url: media.HD },
        caption: "🎥 *HD Video*",
      }, { quoted: m });
      twitterDownloads.delete(m.from);
    } else if (userChoice === "2") {
      await sock.sendMessage(m.from, {
        video: { url: media.SD },
        caption: "🎥 *SD Video*",
      }, { quoted: m });
      twitterDownloads.delete(m.from);
    } else if (userChoice === "3") {
      await sock.sendMessage(m.from, {
        audio: { url: media.audio },
        mimetype: "audio/mp4",
        caption: "🎵 *Twitter Audio*",
      }, { quoted: m });
      twitterDownloads.delete(m.from);
    } else {
      await sock.sendMessage(m.from, {
        text: "*❌ Invalid choice! Please reply with 1️⃣, 2️⃣, or 3️⃣.*",
      }, { quoted: m });
    }
  }
};

export default twitter;
