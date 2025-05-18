import Jimp from 'jimp';
import config from '../../config.js';

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
