const forwardCmd = async (m, sock) => {
  if (m.isGroup) return; // Ignore messages from groups

  if (!m.body) return; // Ignore empty messages

  const message = m.body.toLowerCase().trim(); // Convert message to lowercase and trim spaces

  // Keywords list
  const keywords = ["send me", "sendme", "send", "snd", "snt", "sent", "sent me"];
  let detectedKeyword = keywords.find(keyword => message.includes(keyword));

  if (!detectedKeyword) return; // Ignore if no keyword matches

  // Function to forward message with caption
  const forwardWithCaption = async (msgToForward) => {
    const msgType = Object.keys(msgToForward.message)[0]; // Get the type of message (video, image, etc.)
    const caption = msgToForward.message[msgType]?.caption || ''; // Extract caption if available

    await sock.sendMessage(
      m.from,
      {
        forward: msgToForward, // Forward the original message
        caption: caption, // Include caption
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardingScore: 999,
        },
      },
      { quoted: m }
    );

    await m.react('✅'); // React with success icon
  };

  // Check if the message has multimedia (video, audio, image, or voice)
  const isMultimedia =
    m.message?.videoMessage || 
    m.message?.audioMessage || 
    m.message?.imageMessage || 
    m.message?.voiceMessage;

  if (isMultimedia) {
    await forwardWithCaption(m);
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
        await forwardWithCaption(m.quoted);
      } else {
        await m.reply("Please reply to a WhatsApp status with a multimedia message.");
        await m.react('❌');
      }
    } else {
      await m.reply("Please reply to a WhatsApp status.");
      await m.react('❌');
    }
  }
};

export default forwardCmd;
