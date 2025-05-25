import config from '../../config.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from 'path';

const blur = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["blur", "bluredit"].includes(cmd)) {
    try {
      const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      await m.React('📸');

      // Improved media detection
      const quotedMsg = m.quoted ? m.quoted : m;
      const isImage = quotedMsg.message?.imageMessage || 
                     quotedMsg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

      if (!isImage) {
        await m.React('❌');
        return sock.sendMessage(m.from, { 
          text: "Please reply to an image or send an image with the command" 
        }, { quoted: m });
      }

      // Download the media - improved method
      let mediaBuffer;
      try {
        mediaBuffer = await sock.downloadMediaMessage(quotedMsg);
      } catch (downloadError) {
        await m.React('❌');
        return sock.sendMessage(m.from, { 
          text: "Failed to download the image. Please try again." 
        }, { quoted: m });
      }

      // Determine file extension
      let extension = '.jpg'; // default to jpg
      const mimeType = quotedMsg.message?.imageMessage?.mimetype || 'image/jpeg';
      if (mimeType.includes('png')) extension = '.png';

      const tempFilePath = path.join(os.tmpdir(), `blur_${Date.now()}${extension}`);
      fs.writeFileSync(tempFilePath, mediaBuffer);

      // Upload to Catbox
      const form = new FormData();
      form.append('fileToUpload', fs.createReadStream(tempFilePath), `image${extension}`);
      form.append('reqtype', 'fileupload');

      const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
      });

      const imageUrl = uploadResponse.data;
      fs.unlinkSync(tempFilePath);

      if (!imageUrl) {
        throw new Error("Failed to upload image to Catbox");
      }

      // Process the image
      const apiUrl = `https://api.popcat.xyz/v2/blur?image=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      if (!response?.data) {
        await m.React('❌');
        return sock.sendMessage(m.from, { 
          text: "Error processing image. Please try again later." 
        }, { quoted: m });
      }

      await sock.sendMessage(
        m.from,
        {
          image: Buffer.from(response.data, "binary"),
          caption: `> *Powered by JawadTechX*`,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true
          }
        },
        { quoted: m }
      );

      await m.React('✅');

    } catch (error) {
      console.error("Blur Error:", error);
      await m.React('❌');
      sock.sendMessage(m.from, { 
        text: `Error: ${error.message || "Failed to process image"}` 
      }, { quoted: m });
    }
  }
};

export default blur;
