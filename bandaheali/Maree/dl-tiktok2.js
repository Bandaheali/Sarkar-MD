import axios from "axios";
import config from "../../config.cjs"; // Ensure this matches your project setup

const dltiktok2 = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "tiktok2" || cmd === "tt2") {
    if (!text) {
      return sock.sendMessage(m.from, {
        text: "*❌ Please provide a TikTok video link.*\n\n📌 *Usage:* .tiktok2 [TikTok URL]",
      }, { quoted: m });
    }

    const api = `https://api.paxsenix.biz.id/dl/tiktok?url=${encodeURIComponent(text)}`;

    await sock.sendMessage(m.from, {
      text: "🔄 *Fetching TikTok video details...*",
    }, { quoted: m });

    try {
      const response = await axios.get(api);
      const { ok, detail, downloadsUrl } = response.data;

      if (!ok || !downloadsUrl.video) {
        return sock.sendMessage(m.from, {
          text: "*❌ Failed to retrieve the video. The API may be down or the link is invalid.*",
        }, { quoted: m });
      }

      const caption = `🎵 *TikTok Video Found!*\n\n📌 *Title:* ${detail.description}\n👤 *Author:* ${detail.author}\n👀 *Views:* ${detail.view}\n❤️ *Likes:* ${detail.like}\n💬 *Comments:* ${detail.comment}\n🔄 *Shares:* ${detail.share}\n\n1️⃣ *Reply with 1 for Video (No Watermark)*\n2️⃣ *Reply with 2 for Video (Watermark)*\n3️⃣ *Reply with 3 for Audio (MP3)*\n\n> *Powered By Sarkar-MD*`;

      // Send Thumbnail & Caption
      await sock.sendMessage(m.from, {
        image: { url: detail.cover },
        caption,
      }, { quoted: m });

      // Wait for User Reply
      sock.ev.on("messages.upsert", async (data) => {
        const msg = data.messages[0];
        if (!msg.message || msg.key.remoteJid !== m.from || msg.key.fromMe) return;

        const userReply = msg.message.conversation || msg.message.extendedTextMessage?.text;

        // ✅ Check if the message is a reply (quoted)
        if (!msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
          return; // ❌ If the message is not a reply, ignore it
        }

        if (userReply === "1") {
          await sock.sendMessage(m.from, {
            video: { url: downloadsUrl.video },
            caption: "🎥 *No Watermark Video*\n\n*_DOWNLOADED BY SARKAR-MD_*",
          }, { quoted: msg });
        } else if (userReply === "2") {
          await sock.sendMessage(m.from, {
            video: { url: downloadsUrl.video_wm },
            caption: "🎥 *Watermark Video*\n\n*_DOWNLOADED BY SARKAR-MD_*",
          }, { quoted: msg });
        } else if (userReply === "3") {
          await sock.sendMessage(m.from, {
            audio: { url: downloadsUrl.music },
            mimetype: "audio/mp3",
            ptt: false,
          }, { quoted: msg });
        }
      });
    } catch (error) {
      console.error(error);
      return sock.sendMessage(m.from, {
        text: "*❌ An error occurred while processing your request. Please try again later.*",
      }, { quoted: m });
    }
  }
};

export default dltiktok2;
