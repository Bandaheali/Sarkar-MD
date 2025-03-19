const forwardCmd = async (m, sock) => {
  // Check if the message is from a group
  if (m.isGroup) {
    return; // Ignore the message if it's from a group
  }

  if (!m.body) return; // Agar message empty hai toh ignore kar do

  const message = m.body.toLowerCase(); // Message ko lowercase mein convert kar do

  let response = ""; // Response message set karne ke liye variable

  if (message.includes("send me")) {
    response = "Send Me keyword detected!";
  } else if (message.includes("sendme")) {
    response = "SendMe keyword detected!";
  } else if (message.includes("send")) {
    response = "Send keyword detected!";
  } else if (message.includes("snd")) {
    response = "Snd keyword detected!";
  }

  if (response) {
    await m.reply(response); // Response bhej do
  } else {
    return; // Agar koi keyword match nahi hua toh function yahin stop ho jayega
  }

  // Check if the message has multimedia (video, audio, image, or voice)
  const isMultimedia =
    m.message?.videoMessage || // Video
    m.message?.audioMessage || // Audio
    m.message?.imageMessage || // Image
    m.message?.voiceMessage;   // Voice

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
        quotedMessage.videoMessage || // Quoted video
        quotedMessage.audioMessage || // Quoted audio
        quotedMessage.imageMessage || // Quoted image
        quotedMessage.voiceMessage;   // Quoted voice

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
        await m.reply("This is not a multimedia message. Only videos, audios, images, or voices can be forwarded.");
        await m.react('❌'); // React with an error icon
      }
    } else {
      await m.reply("This is not a multimedia message. Only videos, audios, images, or voices can be forwarded.");
      await m.react('❌'); // React with an error icon
    }
  }
};

export default forwardCmd;
