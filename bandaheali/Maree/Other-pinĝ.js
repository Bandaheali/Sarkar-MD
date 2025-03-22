import config from '../../config.cjs';

const ping = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["ping", "speed", "p"].includes(cmd)) {
    const start = performance.now();
    await m.React('⏳'); // Loading reaction

    const animations = ['🔄', '🔃', '⏳', '⏱️', '🌀'];
    const speedEmojis = ['💨', '🚀', '⚡', '🔥', '🎯', '✨', '🌪️', '💥'];

    const animation = animations[Math.floor(Math.random() * animations.length)];
    let speedEmoji = speedEmojis[Math.floor(Math.random() * speedEmojis.length)];

    while (animation === speedEmoji) {
      speedEmoji = speedEmojis[Math.floor(Math.random() * speedEmojis.length)];
    }

    await m.React(animation); // Intermediate animation emoji

    const end = performance.now();
    const responseTime = (end - start).toFixed(2);

    const loadingPhases = [
      `*⏳ Calculating speed...*`,
      `*🚀 Almost done...*`,
      `*🎯 Getting results...*`
    ];

    for (const phase of loadingPhases) {
      await sock.sendMessage(m.from, { text: phase }, { quoted: m });
      await new Promise(res => setTimeout(res, 500));
    }

    const responseText = `> *SARKAR-MD SPEED:* *${responseTime}ms* ${speedEmoji}`;

    await sock.sendMessage(
      m.from,
      {
        text: responseText,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardingScore: 999,
          externalAdReply: {
            title: "🚀 Sarkar-MD Speed Test",
            body: "Fastest WhatsApp Bot",
            thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
            sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork',
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
