import axios from "axios";
import config from "../../config.cjs";
import fetch from "node-fetch";

const toolsCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const pushName = m.pushName || "User";
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const args = m.body.slice(prefix.length).trim().split(" ").slice(1);
  const query = args.join(" ");

  // Send a formatted command response
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
    if (!args[0]) return await sendCommandMessage("❌ *Usage:* .fetch <API URL>");

    await m.React("⏳");
    try {
      const response = await fetch(args[0]);
      const data = await response.json();
      const formattedData = JSON.stringify(data, null, 2).slice(0, 4000);

      await m.React("✅");
      await sendCommandMessage(`📌 *API Response:*  \n\`\`\`${formattedData}\`\`\``);
    } catch (error) {
      await m.React("❌");
      await sendCommandMessage("⚠️ *Invalid API URL or Network Error!*");
    }
  }

  // ✅ TTS (Text-to-Speech) Command ✅
  if (cmd === "tts") {
    if (!query) return await sendCommandMessage("❌ *Please provide text for TTS!*");

    await m.React("⏳");
    try {
      const apiUrl = `https://bk9.fun/tools/tts?q=${encodeURIComponent(query)}&lang=`;

      await sock.sendMessage(
        m.from,
        {
          audio: { url: apiUrl },
          mimetype: "audio/mp4",
          ptt: true,
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
              body: "Listen to TTS Audio",
              thumbnailUrl:
                "https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp",
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
      await m.React("❌");
      await sendCommandMessage("⚠️ *Failed to generate TTS audio. Please try again!*");
    }
  }

  // ✅ URL Shortener ✅
  if (cmd === "shorten") {
    if (!args[0]) return await sendCommandMessage("❌ *Usage:* .shorten <URL>");

    await m.React("⏳");
    try {
      const apiUrl = `https://apis.giftedtech.web.id/api/tools/shorturl?apikey=gifted&url=${encodeURIComponent(args[0])}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data.success || !data.result) throw new Error("Invalid response from API");

      await sendCommandMessage(data.result); // Send only the shortened link
      await sendCommandMessage("🚀 *_Sarkar-MD Powered by BANDAHEALI_*"); // Separate powered message

      await m.React("✅");
    } catch (error) {
      await m.React("❌");
      await sendCommandMessage("⚠️ *Failed to shorten the URL. Please try again!*");
    }
  }
};

export default toolsCommand;
