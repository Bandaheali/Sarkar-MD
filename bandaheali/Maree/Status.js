const forwardCmd = async (message, client) => {
  if (message.isGroup) {
    return;
  }
  
  if (!message.body) {
    return;
  }

  const body = message.body.toLowerCase().trim();
  const triggers = ["send me", "sendme", "send", "snd", "snt", "sent", "sent me"];
  const foundTrigger = triggers.find(trigger => body.includes(trigger));
  
  if (!foundTrigger) {
    return;
  }

  const forwardMedia = async (mediaMsg) => {
    const mediaType = Object.keys(mediaMsg.message)[0];
    const caption = mediaMsg.message[mediaType]?.["caption"] || "Keep Using Sarkar-MD";
    
    await client.sendMessage(message.from, {
      forward: mediaMsg,
      caption: caption,
      contextInfo: {
        mentionedJid: [message.sender],
        isForwarded: false,
        forwardingScore: 999
      }
    }, {
      quoted: message
    });
    
    await message.react('✅');
  };

  const directMedia = message.message?.["videoMessage"] || 
                      message.message?.["audioMessage"] || 
                      message.message?.["imageMessage"] || 
                      message.message?.["voiceMessage"];
  
  if (directMedia) {
    await forwardMedia(message);
  } else if (message.quoted?.["message"]) {
    const quotedMsg = message.quoted.message;
    const quotedMedia = quotedMsg.videoMessage || 
                       quotedMsg.audioMessage || 
                       quotedMsg.imageMessage || 
                       quotedMsg.voiceMessage;
    
    if (quotedMedia) {
      await forwardMedia(message.quoted);
    }
  }
};

export default forwardCmd;
