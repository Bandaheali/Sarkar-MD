const forwardCmd = async (m, sock) => {
  // Check if the message is from a group
  if (m.isGroup) return; // Ignore the message if it's from a group

  if (!m.body) return; // Agar message empty hai toh ignore kar do

  const message = m.body.toLowerCase().trim(); // Message ko lowercase mein convert aur trim kar do

  // Keywords list
  const keywords = ["send me", "sendme", "send", "snd"];
  let detectedKeyword = keywords.find(keyword => message.includes(keyword));

  if (!detectedKeyword) return; // Agar koi keyword match nahi hota, toh ignore kar do

  // Respond based on the detected keyword
  await m.reply(`"${detectedKeyword}" keyword detected!`);

  // Check if the message has multimedia (video, audio, image, or voice)
  const isMultimedia =
    m.message?.videoMessage || 
    m.message?.audioMessage || 
    m.message?.imageMessage || 
    m.message?.voiceMessage;

  if (isMultimedia) {
    // Forward the multimedia message
    await sock.sendMessage(
      m.from,
      {
        forward: m, // Forward the original message
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardingScore: 999,
        },
      },
      { quoted: m }
    );

    await m.react('✅'); // React with a success icon
  } else {
    // If the message is not multimedia, check if it's a reply to a multimedia message
    if (m.quoted?.message) {
      const quotedMessage = m.quoted.message;
      const isQuotedMultimedia =
        quotedMessage.videoMessage || 
        quotedMessage.audioMessage || 
        quotedMessage.imageMessage || 
        quotedMessage.voiceMessage;

      if (isQuotedMultimedia) {
        // Forward the quoted multimedia message
        await sock.sendMessage(
          m.from,
          {
            forward: m.quoted, // Forward the quoted message
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardingScore: 999,
            },
          },
          { quoted: m }
        );

        await m.react('✅'); // React with a success icon
      } else {
        await m.reply("please reply to a whatsapp status ");
        await m.react('❌'); // React with an error icon
      }
    } else {
      await m.reply("please reply to whatsapp status.");
      await m.react('❌'); // React with an error icon
    }
  }
};

export default forwardCmd
