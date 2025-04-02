import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import os from "os";
import path from "path";
import config from "../../config.cjs";

const imgscan = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  
  if (["imgscan", "scanimg", "imagescan", "analyzeimg"].includes(cmd)) {
    try {
      // Check if quoted message exists and has media
      const quotedMsg = m.quoted || m;
      const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';

      if (!mimeType || !mimeType.startsWith('image/')) {
        return sock.sendMessage(m.from, { text: "Please reply to an image file (JPEG/PNG)" });
      }

      // Download the media
      const mediaBuffer = await quotedMsg.download();
      const fileSize = formatBytes(mediaBuffer.length);

      // Get file extension based on mime type
      let extension = '';
      if (mimeType.includes('image/jpeg')) extension = '.jpg';
      else if (mimeType.includes('image/png')) extension = '.png';
      else {
        return sock.sendMessage(m.from, { text: "Unsupported image format. Please use JPEG or PNG" });
      }

      const tempFilePath = path.join(os.tmpdir(), `imgscan_${Date.now()}${extension}`);
      fs.writeFileSync(tempFilePath, mediaBuffer);

      await m.React('🔍'); // React with a search icon

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

      // Scan the image using the API
      const scanUrl = `https://apis.davidcyriltech.my.id/imgscan?url=${encodeURIComponent(imageUrl)}`;
      const scanResponse = await axios.get(scanUrl);

      if (!scanResponse.data.success) {
        throw scanResponse.data.message || "Failed to analyze image";
      }

      // Format the response
      await sock.sendMessage(
        m.from,
        { text: `🔍 *Image Analysis Results*\n\n${scanResponse.data.result}\n\n*_POWERED BY SARKAR-MD🫡` },
        { quoted: m }
      );

      await m.React('✅'); // React with a success icon

    } catch (error) {
      console.error('Image Scan Error:', error);
      await sock.sendMessage(m.from, { text: `❌ Error: ${error.message || error}` });
    }
  }
};

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default imgscan;
