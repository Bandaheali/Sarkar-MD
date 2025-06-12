import config from '../../config.js';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import ffmpeg from 'fluent-ffmpeg';
import { fileTypeFromFile } from 'file-type';

const tostatus = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["tostatus"].includes(cmd)) {
    // Check if user is owner/creator
    const owner = config.OWNER_NUMBER;
    const bot = await sock.decodeJid(sock.user.id);
    const dev = "923253617422@s.whatsapp.net";
    const isCreator = [owner, bot, dev].includes(m.sender);
    
    if (!isCreator) {
      await m.reply("🚫 This command is only for my owner!");
      return;
    }

    const quoted = m.quoted ? m.quoted : null;
    const mime = quoted?.mimetype || "";
    const q = m.body.slice(prefix.length + cmd.length).trim();

    try {
      if (!quoted) {
        return await m.reply(`*Usage:*\nReply to a message (text/image/video/audio/sticker) to post it as status`);
      }

      // For text messages
      if (quoted.text && !mime) {
        await sock.updateProfileStatus(quoted.text);
        return await m.reply("✅ Text status updated successfully!");
      }

      // For media messages
      if (mime) {
        const mediaPath = `${tmpdir()}/${Math.random().toString(36)}`;
        const buffer = await sock.downloadMediaMessage(quoted);
        writeFileSync(mediaPath, buffer);

        // Get actual file type
        const fileInfo = await fileTypeFromFile(mediaPath);
        const actualMime = fileInfo?.mime || mime;

        try {
          if (/image/.test(actualMime) || /sticker/.test(actualMime)) {
            await sock.sendMessage("status@broadcast", { 
              image: { url: mediaPath },
              caption: q || "",
              mimetype: actualMime
            });
            await m.reply("✅ Image/Sticker posted to status.");
          } 
          else if (/video/.test(actualMime)) {
            // Compress video if needed
            const compressedPath = `${mediaPath}-compressed.mp4`;
            await new Promise((resolve, reject) => {
              ffmpeg(mediaPath)
                .outputOptions([
                  '-c:v libx264',
                  '-crf 28',
                  '-preset fast',
                  '-c:a aac',
                  '-b:a 128k'
                ])
                .save(compressedPath)
                .on('end', resolve)
                .on('error', reject);
            });

            await sock.sendMessage("status@broadcast", { 
              video: { url: compressedPath },
              caption: q || "",
              mimetype: 'video/mp4'
            });
            unlinkSync(compressedPath);
            await m.reply("✅ Video posted to status.");
          } 
          else if (/audio/.test(actualMime)) {
            await sock.sendMessage("status@broadcast", { 
              audio: { url: mediaPath },
              mimetype: 'audio/mp4',
              ptt: true
            });
            await m.reply("✅ Audio posted to status.");
          } 
          else {
            await m.reply("⚠️ Unsupported media type");
          }
        } finally {
          unlinkSync(mediaPath); // Clean up temp file
        }
        return;
      }
    } catch (error) {
      console.error("Status Error:", error);
      await m.reply(`⚠️ Failed to post status: ${error.message}`);
    }
  }
};

export default tostatus;
