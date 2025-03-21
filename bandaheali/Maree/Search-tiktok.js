import fetch from "node-fetch";
import config from '../../config.cjs'; // Ensure this matches your project setup

const tiktoksearch = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "tiktoksearch" || cmd === "tiktoks" || cmd === "tiks") {
    if (!text) {
      return sock.sendMessage(
        m.from,
        { text: "🌸 What do you want to search on TikTok?\n\n*Usage Example:*\n.tiktoksearch <query>" },
        { quoted: m }
      );
    }

    await m.React('⌛'); // React with loading icon
    try {
      sock.sendMessage(m.from, { text: `🔎 Searching TikTok for: *${text}*` }, { quoted: m });

      const response = await fetch(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
      const data = await response.json();

      if (!data || !data.data || data.data.length === 0) {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "❌ No results found for your query. Please try with a different keyword." }, { quoted: m });
      }

      // Get up to 7 random results
      const results = data.data.slice(0, 7).sort(() => Math.random() - 0.5);

      for (const video of results) {
        const message = `🌸 *_Sarkar-MD TikTok Video Result_* :\n\n`
          + `*• Title*: ${video.title}\n`
          + `*• Author*: ${video.author || 'Unknown'}\n`
          + `*• Duration*: ${video.duration || "Unknown"}\n`
          + `*• URL*: ${video.link}\n\n`;

        if (video.nowm) {
          await sock.sendMessage(m.from, {
            video: { url: video.nowm },
            caption: message,
            contextInfo: {
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363315182578784@newsletter',
                newsletterName: "Sarkar-MD",
                serverMessageId: -1,
              },
              forwardingScore: 999,
              externalAdReply: {
                title: "✨ Sarkar-MD ✨",
                body: "TikTok Search Results",
                thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
                sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork',
                mediaType: 1,
                renderLargerThumbnail: false,
              },
            },
          }, { quoted: m });
        } else {
          sock.sendMessage(m.from, { text: `❌ Failed to retrieve video for *"${video.title}"*.` }, { quoted: m });
        }
      }

      await m.React('✅'); // React with success icon
    } catch (error) {
      console.error("Error in TikTokSearch command:", error);
      await m.React('❌');
      sock.sendMessage(m.from, { text: "❌ An error occurred while searching TikTok. Please try again later." }, { quoted: m });
    }
  }
};

export default tiktoksearch;
