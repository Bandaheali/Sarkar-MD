import config from '../../config.js';

const tostatus = async (m, sock) => {
  const prefix = config.PREFIX;
  const owner = config.OWNER_NUMBER;
  const bot = await sock.decodeJid(sock.user.id);
  const dev = "923253617422@s.whatsapp.net";
  const isCreater = [owner, bot, dev].includes(m.sender);
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["tostatus"].includes(cmd)) {
    if (!isCreater) {
      await m.reply("🚫 This command is only for my owner!");
      return;
    }

    const quoted = m.quoted ? m.quoted : null;
    const mime = quoted?.mimetype || "";
    const q = m.body.slice(prefix.length + cmd.length).trim();

    try {
      if (!quoted) {
        await m.reply(`*Usage:*\nReply to a message (text/image/video/audio/sticker) to post it as status`);
        return;
      }

      // For text messages
      if (quoted.text && !mime) {
        await sock.sendMessage("status@broadcast", { text: quoted.text });
        await m.reply("✅ Text status posted.");
        return;
      }

      // For media messages
      if (mime) {
        let media = await sock.downloadAndSaveMediaMessage(quoted);
        
        if (/image/.test(mime) || /sticker/.test(mime)) {
          await sock.sendMessage("status@broadcast", { 
            image: { url: media },
            caption: q || ""
          });
          await m.reply("✅ Image/Sticker posted to status.");
        } 
        else if (/video/.test(mime)) {
          await sock.sendMessage("status@broadcast", { 
            video: { url: media },
            caption: q || ""
          });
          await m.reply("✅ Video posted to status.");
        } 
        else if (/audio/.test(mime)) {
          await sock.sendMessage("status@broadcast", { 
            audio: { url: media },
            mimetype: "audio/mp4",
            ptt: true
          });
          await m.reply("✅ Audio posted to status.");
        } 
        else {
          await m.reply("⚠️ Unsupported media type");
        }
        return;
      }

    } catch (error) {
      await m.reply("⚠️ Failed to post status: " + error.message);
      console.error("Status Error:", error);
    }
  }
};

export default tostatus;
