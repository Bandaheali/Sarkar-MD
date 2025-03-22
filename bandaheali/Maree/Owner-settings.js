import config from '../../config.cjs';

const configCheck = async (m, sock) => {
  const ownerNumber = config.OWNER_NUMBER.replace(/[^0-9]/g, ""); // Remove non-numeric characters
  const senderNumber = m.sender.split('@')[0]; // Extract sender number

  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  // ✅ Pehle command match karo, phir owner check karo  
  if (["allvar", "settings", "allvars"].includes(cmd)) {
    if (senderNumber !== ownerNumber) {
      return await sock.sendMessage(m.from, { text: "❌ *Only the Owner can use this command!*" }, { quoted: m });
    }

    await m.React('⏳'); // React with a loading icon

    // ✅ Sirf Strings aur Booleans Ko Filter Karo
    const configValues = Object.entries(config)
      .filter(([_, value]) => typeof value === 'boolean' || typeof value === 'string') // Remove unwanted types
      .map(([key, value]) => `*${key}:* ${value}`)
      .join("\n");

    const responseText = `> *BOT CONFIG SETTINGS:*\n\n${configValues}`;

    await sock.sendMessage(
      m.from,
      {
        text: responseText,
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
            title: "✨ Sarkar-MD Settings ✨",
            body: "Bot Configuration Overview",
            thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
            sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork',
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

export default configCheck;
