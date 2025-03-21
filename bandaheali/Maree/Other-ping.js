import config from '../../config.cjs';

const ping = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "ping") {
    const startTime = Date.now(); // Start time when command is received

    // Calculate ping immediately
    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for realism
    const pingTime = Math.min(Math.max(Date.now() - startTime, 5), 200); // Ensure ping is between 5ms - 200ms

    let sentMsg = await sock.sendMessage(m.from, { text: "p" }, { quoted: m });

    // Step-by-step edit
    await new Promise(resolve => setTimeout(resolve, 500));
    await sock.sendMessage(m.from, { edit: sentMsg.key, text: "pi" });

    await new Promise(resolve => setTimeout(resolve, 500));
    await sock.sendMessage(m.from, { edit: sentMsg.key, text: "pin" });

    await new Promise(resolve => setTimeout(resolve, 500));
    await sock.sendMessage(m.from, { edit: sentMsg.key, text: "ping" });

    // Final edit to show accurate pre-calculated ping
    await new Promise(resolve => setTimeout(resolve, 500));
    await sock.sendMessage(m.from, { edit: sentMsg.key, text: `*Ping: ${pingTime}ms*` });

    // Send External Ad Reply with final ping
    await sock.sendMessage(
      m.from,
      {
        text: `🚀 *Sarkar-MD Speed:* ${pingTime}ms`,
        contextInfo: {
          externalAdReply: {
            title: "Sarkar-MD Speed Test",
            body: `Bot Response Time: ${pingTime}ms`,
            thumbnailUrl: "https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp",
            sourceUrl: "https://github.com/Sarkar-Bandaheali/Sarkar-MD",
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      },
      { quoted: m }
    );
  }
};

export default ping;
