import config from '../../config.cjs'; // Ensure this matches your project setup

const add = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "add" || cmd === "aja") {
    try {
      if (!m.isGroup) {
        await m.React('❌'); // React with an error icon
        return sock.sendMessage(
          m.from,
          {
            text: "❌ This command can only be used in groups.",
          },
          { quoted: m }
        );
      }

      // Extract bot owner's number
      const botOwner = sock.user.id.split(":")[0];

      // Restrict command usage to the bot owner only
      if (m.senderNumber !== botOwner) {
        await m.React('❌'); // React with an error icon
        return sock.sendMessage(
          m.from,
          {
            text: "❌ Only the bot owner can use this command.",
          },
          { quoted: m }
        );
      }

      // Ensure the bot is an admin
      const isBotAdmins = (await sock.groupMetadata(m.from)).participants.find(
        (participant) => participant.id === sock.user.id
      )?.admin;

      if (!isBotAdmins) {
        await m.React('❌'); // React with an error icon
        return sock.sendMessage(
          m.from,
          {
            text: "❌ I need to be an admin to add users.",
          },
          { quoted: m }
        );
      }

      // Validate user input
      if (!text || isNaN(text)) {
        await m.React('❌'); // React with an error icon
        return sock.sendMessage(
          m.from,
          {
            text: "❌ Please provide a valid phone number to add.",
          },
          { quoted: m }
        );
      }

      const userToAdd = `${text}@s.whatsapp.net`;

      // Attempt to add the user to the group
      const response = await sock.groupParticipantsUpdate(m.from, [userToAdd], "add");

      // Check if the user was successfully added
      if (response[0].status === 200) {
        await m.React('✅'); // React with a success icon
        await sock.sendMessage(
          m.from,
          {
            text: `✅ User *${text}* has been added to the group.`,
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
                body: "User Added Successfully",
                thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
                sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork',
                mediaType: 1,
                renderLargerThumbnail: false,
              },
            },
          },
          { quoted: m }
        );
      } else {
        await m.React('❌'); // React with an error icon
        await sock.sendMessage(
          m.from,
          {
            text: "❌ Failed to add user. Make sure the number is correct and they are not already in the group.",
          },
          { quoted: m }
        );
      }
    } catch (e) {
      console.error("Error adding user:", e);
      await m.React('❌'); // React with an error icon
      await sock.sendMessage(
        m.from,
        {
          text: "❌ An error occurred while adding the user. Please try again.",
        },
        { quoted: m }
      );
    }
  }
};

export default add;
