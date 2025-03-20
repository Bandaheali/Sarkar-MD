import { downloadMediaMessage } from '@whiskeysockets/baileys';
import Jimp from 'jimp'; // Install: npm install jimp
import config from '../../config.cjs';

const setProfilePicture = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  // Check if the command is "fullpp"
  if (cmd !== "fullpp") return;

  // Check if the sender is the bot or owner
  const ownerNumberWithId = `${config.OWNER_NUMBER}@s.whatsapp.net`;
  const isOwnerOrBot = [ownerNumberWithId, sock.user.id].includes(m.sender);
  if (!isOwnerOrBot) {
    return m.reply("❌ You don't have permission to use this command.");
  }

  // Check if the message is a reply to an image
  if (!m.quoted?.message?.imageMessage) {
    return m.reply("⚠️ Please *reply to an image* to set as profile picture.");
  }

  await m.React('⏳'); // React with loading icon

  try {
    // Download the image with retry logic
    let media;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        media = await downloadMediaMessage(m.quoted, 'buffer');
        if (media) break;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          await m.React('❌');
          return m.reply("❌ Failed to download image after multiple attempts. Try again.");
        }
      }
    }

    // Validate and process the image
    const image = await Jimp.read(media).catch(() => null);
    if (!image) {
      await m.React('❌');
      return m.reply("❌ Invalid image format. Please send a valid image.");
    }

    // Convert image to square format
    const size = Math.max(image.bitmap.width, image.bitmap.height);
    const squareImage = new Jimp(size, size, 0x000000FF); // Black background
    squareImage.composite(image, (size - image.bitmap.width) / 2, (size - image.bitmap.height) / 2);

    // Resize to 640x640 (WhatsApp recommended size)
    squareImage.resize(640, 640);

    // Convert image to buffer
    const buffer = await squareImage.getBufferAsync(Jimp.MIME_JPEG);

    // Update profile picture
    await sock.updateProfilePicture(m.sender, buffer);

    await m.React('✅'); // React with success icon

    // Send success message
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
