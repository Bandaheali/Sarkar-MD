const forwardCmd = async (m, sock) => {
  if (m.isGroup) return;

  if (!m.body || !["sendme", "send", "send me", "snd"].some(keyword => m.body.toLowerCase().includes(keyword))) {
    return;
  }

  const isMultimedia =
    m.message?.videoMessage || 
    m.message?.audioMessage || 
    m.message?.imageMessage || 
    m.message?.voiceMessage || 
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage || 
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage || 
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || 
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.voiceMessage;

  if (isMultimedia) {
    await sock.sendMessage(
      m.from,
      {
        forward: m, 
        contextInfo: { mentionedJid: [m.sender], isForwarded: true, forwardingScore: 999 },
      },
      { quoted: m }
    );

    await sock.sendMessage(m.from, { react: { text: "✅", key: m.key } });
  } else {
    if (m.quoted?.message) {
      const quotedMessage = m.quoted.message;
      const isQuotedMultimedia =
        quotedMessage.videoMessage || 
        quotedMessage.audioMessage || 
        quotedMessage.imageMessage || 
        quotedMessage.voiceMessage;

      if (isQuotedMultimedia) {
        await sock.sendMessage(
          m.from,
          {
            forward: m.quoted, 
            contextInfo: { mentionedJid: [m.sender], isForwarded: true, forwardingScore: 999 },
          },
          { quoted: m }
        );

        await sock.sendMessage(m.from, { react: { text: "✅", key: m.key } });
      } else {
        await m.reply("This is not a multimedia message. Only videos, audios, images, or voices can be forwarded.");
        await sock.sendMessage(m.from, { react: { text: "❌", key: m.key } });
      }
    } else {
      await m.reply("This is not a multimedia message. Only videos, audios, images, or voices can be forwarded.");
      await sock.sendMessage(m.from, { react: { text: "❌", key: m.key } });
    }
  }
};

export default forwardCmd;
