export const sendFancyReply = async (sock, m, responseText) => {
  await sock.sendMessage(
    m.from,
    {
      text: responseText,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363315182578784@newsletter',
          newsletterName: 'Sarkar-MD',
          serverMessageId: -1,
        },
        externalAdReply: {
          title: '✨ Sarkar-MD ✨',
          body: 'Powered by Sarkar-Bandaheali',
          thumbnailUrl:
            'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
          sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork',
          mediaType: 1,
          renderLargerThumbnail: false,
        },
      },
    },
    { quoted: m }
  );
};
