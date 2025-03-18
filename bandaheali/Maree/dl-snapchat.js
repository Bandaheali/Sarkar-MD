import config from '../../config.cjs'; // Ensure this matches your project setup
import axios from 'axios'; // Install axios if not already installed: npm install axios

const dlsnapchat = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const query = m.body.slice(prefix.length + cmd.length).trim();

  // Check for command aliases
  if (cmd === "dl-snapchat" || cmd === "snapchat" || cmd === "snap") {
    if (!query) {
      return sock.sendMessage(
        m.from,
        { text: "`⚠️PLEASE GAVE A SNAPCHAT VIDEO LINK TO DOWNLAOD `" },
        { quoted: m }
      );
    }

    await m.React("⏳");
    try {
      const apiUrl = `https://api.nexoracle.com/downloader/snapchat?apikey=sarkar_786&url=${query}`;
      const response = await axios.get(apiUrl);
      const data = response.data?.result;
      if (!data || !data.url) throw new Error("Invalid API response");

      const { title, thumb, size, url } = data;
      const messageText = `📹 *${title || "Snapchat Video"}*\n\n📦 *Size:* ${size}\n\n🚀 *_Sarkar-MD Powered by BANDAHEALI_*`;

      await sock.sendMessage(
        m.from,
        {
          video: { url: url }, // Send the video
          caption: messageText,
          thumbnail: thumb, // Set the thumbnail
          contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363315182578784@newsletter",
              newsletterName: "Sarkar-MD",
              serverMessageId: -1,
            },
            externalAdReply: {
              title: "✨ Sarkar-MD ✨",
              body: "Download Snapchat Video",
              thumbnailUrl: "https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp",
              sourceUrl: "https://github.com/Sarkar-Bandaheali/Sarkar-MD",
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        },
        { quoted: m }
      );
      await m.React("✅");
    } catch (error) {
      console.error(error);
      await m.React("❌");
      sock.sendMessage(
        m.from,
        { text: "`AN ERROR OCCURED PLEASE TRY AGAIN LATER`" },
        { quoted: m }
      );
    }
  }
};

export default dlsnapchat;
