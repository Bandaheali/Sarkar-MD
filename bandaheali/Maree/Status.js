const forwardCmd = async (m, sock) => {
  // Check if the message contains "sendme"
  if (!m.body || !m.body.toLowerCase().includes("sendme")) {
    return; // Ignore the message if "sendme" is not present
  }

  // Check if the message has multimedia (video, audio, image, or voice)
  const isMultimedia = m.message?.videoMessage || m.message?.audioMessage || m.message?.imageMessage || m.message?.voiceMessage;

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
    await m.reply("This is not a multimedia message. Only videos, audios, images, or voices can be forwarded.");
    await m.React('❌'); // React with an error icon
  }
};

export default forwardCmd;
