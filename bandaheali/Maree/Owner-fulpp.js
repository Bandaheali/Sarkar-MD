import Jimp from 'jimp';
import config from '../../config.js';
import fs from 'fs';

const fullppCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    if (cmd === 'fullpp') {
      const isQuotedImage = m.quoted && (m.quoted.mtype === 'imageMessage' || 
                      (m.quoted.mtype === 'viewOnceMessage' && m.quoted.msg.mtype === 'imageMessage'));

      if (!isQuotedImage) {
        return sock.sendMessage(m.from, { 
          text: '⚠️ *Please reply to a portrait (9:16) image*' 
        }, { quoted: m });
      }

      await sock.sendMessage(m.from, { 
        text: '⏳ *Processing full screen profile picture...*' 
      }, { quoted: m });

      // Download and process image
      const imageBuffer = await m.quoted.download();
      let image = await Jimp.read(imageBuffer);
      
      // Convert to 9:16 aspect ratio if needed
      const targetRatio = 9/16;
      const currentRatio = image.bitmap.width/image.bitmap.height;
      
      if (Math.abs(currentRatio - targetRatio) > 0.1) {
        await sock.sendMessage(m.from, {
          text: '⚠️ *Image is not 9:16 ratio - adjusting composition*'
        }, { quoted: m });
        
        // Resize to maintain 9:16 ratio
        const newWidth = image.bitmap.height * (9/16);
        image.resize(newWidth, image.bitmap.height);
      }

      // Create WhatsApp-compatible square canvas (1080x1080 recommended)
      const canvasSize = 1080;
      const canvas = new Jimp(canvasSize, canvasSize, 0xFFFFFFFF); // White background
      
      // Calculate positioning to show top portion (like WhatsApp does)
      const yOffset = 0; // Start from top
      const xOffset = (canvasSize - image.bitmap.width) / 2;
      
      // Composite the image onto canvas
      canvas.composite(image, xOffset, yOffset);

      // Save temporary file
      const tempFilePath = './temp_profile_pic.jpg';
      await canvas.quality(90).writeAsync(tempFilePath);

      // Update profile picture
      await sock.updateProfilePicture(sock.user.id, { url: tempFilePath });
      
      // Clean up
      fs.unlinkSync(tempFilePath);

      await sock.sendMessage(m.from, { 
        text: '✅ *Full screen profile picture set successfully!*\n\nNote: WhatsApp will display the top portion of your image in the circular frame.' 
      }, { quoted: m });
    }
  } catch (err) {
    console.error('Profile picture error:', err);
    await sock.sendMessage(m.from, { 
      text: `❌ *Error:* ${err.toString().substring(0, 150)}` 
    }, { quoted: m });
  }
};

export default fullppCmd;

















/*




import Jimp from 'jimp';
import config from '../../config.js';
import fs from 'fs';
const fullppCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    if (cmd === 'fullpp') {
      const isQuotedImage = m.quoted && (m.quoted.mtype === 'imageMessage' || 
                      (m.quoted.mtype === 'viewOnceMessage' && m.quoted.msg.mtype === 'imageMessage'));

      if (!isQuotedImage) {
        return sock.sendMessage(m.from, { 
          text: '⚠️ *Please reply to an image or mention any photo*' 
        }, { quoted: m });
      }

      await sock.sendMessage(m.from, { 
        text: '⏳ *Updating profile picture, please wait...*' 
      }, { quoted: m });

      // Download and process image
      const imageBuffer = await m.quoted.download();
      const image = await Jimp.read(imageBuffer);
      
      // Resize and quality adjustments
      image.resize(512, 512) // Standard profile picture size
           .quality(85);     // Good quality with reasonable file size

      // Convert to buffer
      const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

      // Create temporary file path
      const tempFilePath = './temp_profile_pic.jpg';
      await image.writeAsync(tempFilePath);

      // Update profile picture using file path
      await sock.updateProfilePicture(sock.user.id, { url: tempFilePath })
        .then(() => {
          // Clean up temporary file
          fs.unlinkSync(tempFilePath);
        });

      await sock.sendMessage(m.from, { 
        text: '✅ *Profile picture updated successfully!*' 
      }, { quoted: m });
    }
  } catch (err) {
    console.error('Profile picture update error:', err);
    await sock.sendMessage(m.from, { 
      text: `❌ *Error:* ${err.message.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')}` 
    }, { quoted: m });
  }
};

export default fullppCmd;
*/
