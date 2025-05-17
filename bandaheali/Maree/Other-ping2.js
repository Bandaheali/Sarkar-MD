import config from '../../config.js';

const ping2 = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["ping2", "speed2", "pong2"].includes(cmd)) {
    const start = new Date().getTime();
    await m.React('⏳');

    const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
    const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

    const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
    let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

    while (textEmoji === reactionEmoji) {
      textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
    }

    await m.React(reactionEmoji);

    const end = new Date().getTime();
    const responseTime = (end - start).toFixed(2);
    const responseText = `> *SARKAR-MD SPEED: ${responseTime}ms ${textEmoji}*`;

    // Newsletter fix: Ensure accurate origin JID
    const originJid = m.msg?.contextInfo?.remoteJid || m.key?.remoteJid || m.chat || m.from;

    await sock.sendMessage(
      originJid,
      {
        text: responseText,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardingScore: 999,
          ...(originJid.endsWith('@newsletter') && {
            forwardedNewsletterMessageInfo: {
              newsletterJid: originJid,
              newsletterName: "Sarkar-MD",
              serverMessageId: -1,
            }
          }),
          externalAdReply: {
            title: "✨ Sarkar-MD ✨",
            body: "Ping Speed Calculation",
            thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
            sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork',
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      },
      { quoted: m }
    );

    await m.React('✅');
  }
};

export default ping2;
