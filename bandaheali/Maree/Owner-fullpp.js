import { downloadMediaMessage } from '@whiskeysockets/baileys';
import Jimp from 'jimp'; // Install: npm install jimp
import config from '../../config.cjs';

const setProfilePicture = async (m, sock) => {
  const { PREFIX, OWNER_NUMBER } = config;
  const cmd = m.body.startsWith(PREFIX) ? m.body.slice(PREFIX.length).split(' ')[0].toLowerCase() : '';

  if (cmd !== "fullpp") return;

  // Owner & Bot verification
  const ownerJid = `${OWNER_NUMBER}@s.whatsapp.net`;
  const isAllowed = [ownerJid, sock.user.id].includes(m.sender);
  if (!isAllowed) {
    return m.reply("❌ You don't have permission to use this command.");
  }

  // Check if the replied message is an image
  if (!m.quoted?.message?.imageMessage) {
    return m.reply("⚠️ Please *reply to an image* to set as profile picture.");
  }

  await m.React('⏳'); // Loading reaction

  try {
    // Download the image with retry mechanism
    let media;
    for (let i = 0; i < 3; i++) {
      try {
        media = await downloadMediaMessage(m.quoted, 'buffer');
        if (media) break;
      } catch (error) {
        if (i === 2) {
          await m.React('❌');
          return m.reply("❌ Failed to download image. Try again.");
        }
      }
    }

    // Read image using Jimp
    const image = await Jimp.read(media);
    if (!image) throw new Error("Invalid image format");

    // Resize image to square (only if needed)
    const size = Math.max(image.bitmap.width, image.bitmap.height);
    if (image.bitmap.width !== image.bitmap.height) {
      const squareImage = new Jimp(size, size, 0x000000FF);
      squareImage.composite(image, (size - image.bitmap.width) / 2, (size - image.bitmap.height) / 2);
      image.clone(squareImage);
    }

    // Resize to WhatsApp required size (640x640)
    image.resize(640, 640);

    // Convert to buffer
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // Update profile picture
    await sock.updateProfilePicture(m.sender, buffer);

    await m.React('✅'); // Success reaction

    // Success message
    sock.sendMessage(
      m.from,
      {
        text: "✅ *Full-size profile picture updated successfully!*",
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315182578784@newsletter',
            newsletterName: "Sarkar-MD",
            serverMessageId: -1,
          },
          forwardingScore: 999,
          externalAdReply: {
            title: "✨ Sarkar-MD ✨",
            body: "Full Profile Picture Set",
            thumbnailUrl: '',
            sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD',
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      },
      { quoted: m }
    );
  } catch (error) {
    console.error("Error setting profile picture:", error);
    await m.React('❌');
    return m.reply("❌ An error occurred while updating the profile picture.");
  }
};

export default setProfilePicture;
