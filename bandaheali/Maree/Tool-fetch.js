import axios from "axios";
import config from "../../config.js";
import fetch from "node-fetch";

const toolsCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const pushName = m.pushName || "User";

  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const args = m.body.slice(prefix.length).trim().split(" ").slice(1);
  const query = args.join(" "); // Fixed query for TTS

  const sendCommandMessage = async (messageContent) => {
    await sock.sendMessage(
      m.from,
      {
        text: messageContent,
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
            body: pushName,
            thumbnailUrl:
              "https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp",
            sourceUrl: "https://github.com/Sarkar-Bandaheali/Sarkar-MD",
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      },
      { quoted: m }
    );
  };

  // ✅ Fetch API Command ✅
  if (cmd === "fetch" || cmd === "get") {
    if (!args[0]) {
      await sendCommandMessage("❌ *Usage:* .fetch <API URL>");
      return;
    }

    await m.React("⏳");
    try {
      const response = await fetch(args[0]);
      const data = await response.json();
      const formattedData = JSON.stringify(data, null, 2).slice(0, 4000); // Limit message size
      await m.React("✅");
      await sendCommandMessage(`📌 *API Response:*  \n\`\`\`${formattedData}\`\`\``);
    } catch (error) {
      await m.React("❌");
      await sendCommandMessage("❌ *Invalid API or Network Error!*");
    }
  }

};

export default toolsCommand;
