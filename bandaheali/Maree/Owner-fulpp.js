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

      const imageBuffer = await m.quoted.download();
      const image = await Jimp.read(imageBuffer);
      const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

      await sock.updateProfilePicture(sock.user.id, { url: buffer });

      await sock.sendMessage(m.from, { 
        text: '✅ *Profile picture updated successfully!*' 
      }, { quoted: m });
    }
  } catch (err) {
    console.error(err);
    await sock.sendMessage(m.from, { 
      text: `❌ *Error:* ${err.message}` 
    }, { quoted: m });
  }
};

export default fullppCmd;
