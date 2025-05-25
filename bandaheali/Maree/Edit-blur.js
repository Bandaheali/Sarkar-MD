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
      // Helper function to format bytes
      const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      await m.React('📸'); // React with camera emoji

      // Check if quoted message exists and has media
      const quotedMsg = m.quoted ? m.quoted : m;
      const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
      
      if (!mimeType || !mimeType.startsWith('image/')) {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "Please reply to an image file (JPEG/PNG)" }, { quoted: m });
      }

      // Download the media
      const mediaBuffer = await quotedMsg.download();
      const fileSize = formatBytes(mediaBuffer.length);
      
      // Get file extension
      let extension = '';
      if (mimeType.includes('image/jpeg')) extension = '.jpg';
      else if (mimeType.includes('image/png')) extension = '.png';
      else {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "Unsupported image format. Please use JPEG or PNG" }, { quoted: m });
      }

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
      fs.unlinkSync(tempFilePath); // Clean up temp file

      if (!imageUrl) {
        throw "Failed to upload image to Catbox";
      }

      // Process the image
      const apiUrl = `https://api.popcat.xyz/v2/blur?image=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      if (!response || !response.data) {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "Error: The API did not return a valid image. Try again later." }, { quoted: m });
      }

      const imageBuffer = Buffer.from(response.data, "binary");

      await sock.sendMessage(
        m.from,
        {
          image: imageBuffer,
          caption: `> *Powered by JawadTechX*`,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            externalAdReply: {
              title: "✨ Image Editor ✨",
              body: "Blur Effect Applied",
              thumbnailUrl: 'https://example.com/thumbnail.jpg', // Replace with your thumbnail
              sourceUrl: 'https://github.com/your-repo', // Replace with your repo
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        },
        { quoted: m }
      );

      await m.React('✅'); // React with success icon

    } catch (error) {
      console.error("Blur Error:", error);
      await m.React('❌');
      sock.sendMessage(m.from, { 
        text: `An error occurred: ${error.response?.data?.message || error.message || "Unknown error"}` 
      }, { quoted: m });
    }
  }
};

export default blur;
