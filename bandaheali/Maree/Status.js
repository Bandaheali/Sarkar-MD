const forwardCmd = async (m, sock) => {
  // Check if the message is from a group
  if (m.isGroup) {
    return; // Ignore the message if it's from a group
  }

if (!m.body) return; // Agar message empty hai toh ignore kar do

const message = m.body.toLowerCase(); // Message ko lowercase mein convert kar do

if (message.includes("sendme")) {
    console.log("SendMe keyword detected!");
    // Yahan jo bhi action lena hai wo karo
} else if (message.includes("send me")) {
    console.log("Send Me keyword detected!");
    // Yahan jo bhi action lena hai wo karo
} else if (message.includes("send")) {
    console.log("Send keyword detected!");
    // Yahan jo bhi action lena hai wo karo
} else if (message.includes("snd")) {
    console.log("Snd keyword detected!");
    // Yahan jo bhi action lena hai wo karo
} else {
    return; // Agar koi bhi keyword nahi mila toh ignore kar do
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

    await m.React('✅'); // React with a success icon
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

        await m.React('✅'); // React with a success icon
      } else {
        await m.reply("This is not a multimedia message. Only videos, audios, images, or voices can be forwarded.");
        await m.React('❌'); // React with an error icon
      }
    } else {
      await m.reply("This is not a multimedia message. Only videos, audios, images, or voices can be forwarded.");
      await m.React('❌'); // React with an error icon
    }
  }
};

export default forwardCmd;
