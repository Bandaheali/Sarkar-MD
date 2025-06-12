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
    // Check if user is owner/creator
    if(!isCreater) {
      await m.reply("🚫 This command is only for my owner!");
      return;
    }

    const quoted = m.quoted ? m.quoted : null;
    const mime = quoted?.mimetype || "";
    const q = m.body.slice(prefix.length + cmd.length).trim();

    try {
      if (!q && !quoted) {
        await m.reply(`*Usage:*\n- Reply to an image, video, or audio\n- Send a text to post it as a status`);
        return;
      }

      let statusOptions = { statusJidList: Object.keys(global.db.users) };

      if (quoted) {
        if (/image/.test(mime)) {
          let image = await sock.downloadAndSaveMediaMessage(quoted);
          await sock.sendMessage("status@broadcast", { image: { url: image }, caption: q || "" }, statusOptions);
          await m.reply("✅ Image posted to status.");
          return;
        }

        if (/video/.test(mime)) {
          let video = await sock.downloadAndSaveMediaMessage(quoted);
          await sock.sendMessage("status@broadcast", { video: { url: video }, caption: q || "" }, statusOptions);
          await m.reply("✅ Video posted to status.");
          return;
        }

        if (/audio/.test(mime)) {
          let audio = await sock.downloadAndSaveMediaMessage(quoted);
          await sock.sendMessage("status@broadcast", { audio: { url: audio }, mimetype: "audio/mp4", ptt: true }, statusOptions);
          await m.reply("✅ Audio posted to status.");
          return;
        }

        await m.reply("⚠️ Unsupported media type. Reply to an image, video, or audio.");
        return;
      }

      await sock.sendMessage("status@broadcast", { text: q }, statusOptions);
      await m.reply("✅ Text status posted.");
      
    } catch (error) {
      await m.reply("⚠️ Failed to post status.", error);
      console.error(error);
    }
  }
};

export default tostatus;
