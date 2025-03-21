import config from '../../config.cjs';

const about = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["about", "info"].includes(cmd)) {
    await m.React('ℹ️'); // React with an info icon

    const botName = "Sarkar-MD";
    const ownerName = "Sarkar Bandaheali";
    const ownerNumber = "923253617422";
    const teamMember = "Shaban-MD";
    const memberNumber = "923043788282";
    const githubRepo = "https://github.com/Sarkar-Bandaheali/Sarkar-MD";
    const bio = "A powerful WhatsApp bot built with Node.js and Baileys for entertainment, utility, and much more! ✨";

    const aboutText = `
✨ *${botName}* ✨

> Owner: ${ownerName}
> Number: ${ownerNumber} (Contact me for assistance)
> Helper: ${teamMember}
> H-Number: ${memberNumber}
> GitHub: ${githubRepo}
> Bio: ${bio}

> Prefix: ${prefix}

> *Powered by Sarkar-MD*
`;

    await sock.sendMessage(
      m.from,
      {
        text: aboutText,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315182578784@newsletter',
            newsletterName: "Sarkar-MD",
            serverMessageId: -1,
          },
          forwardingScore: 999,
          externalAdReply: {
            title: `About ${botName}`,
            body: "Information about the bot.",
            thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp', // Optional: Replace with a relevant image URL
            sourceUrl: githubRepo,
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      },
      { quoted: m }
    );

    await m.React('✅'); // React with a success icon
  }
};

export default about;
