import config from '../../config.cjs';

const ping = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["ping", "speed", "p"].includes(cmd)) {
    const start = performance.now();
    await m.React('⚡'); // React with lightning icon

    const end = performance.now();
    const responseTime = (end - start).toFixed(2);
    const responseText = `*⚡ SARKAR-MD SPEED:* *${responseTime}ms*`;

    await sock.sendMessage(
      m.from,
      {
        text: responseText,
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315182578784@newsletter',
            newsletterName: "Sarkar-MD",
            serverMessageId: -1,
          },
          forwardingScore: 999, // Score to indicate it has been forwarded
          externalAdReply: {
            title: "✨ Sarkar-MD ✨",
            body: "Ping Speed Calculation",
            thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp', // Thumbnail image
            sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork', // Source link
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      },
      { quoted: m }
    );

    await m.React('✅'); // Success reaction
  }
};

export default ping;
