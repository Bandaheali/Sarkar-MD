import config from '../../config.cjs';
import axios from 'axios';

const profile = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "profile") {
    try {
      await m.React('⏳'); // Loading reaction

      // Improved mention detection
      const mentionedIds = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      
      if (mentionedIds.length === 0) {
        await sock.sendMessage(
          m.from,
          { text: `⚠️ Please mention someone!\nExample: *${prefix}profile @user*` },
          { quoted: m }
        );
        await m.React('❌');
        return;
      }

      const targetUser = mentionedIds[0];
      
      // Fetch all user data in parallel
      const [contact, ppUrl, status] = await Promise.all([
        sock.fetchStatus(targetUser).catch(() => null),
        sock.profilePictureUrl(targetUser, 'image').catch(() => null),
        sock.fetchStatus(targetUser).catch(() => null)
      ]);

      // Get accurate name from contacts
      const user = await sock.contact.getContact(targetUser);
      const username = user?.notify || user?.vname || user?.name || "User";
      
      // Get accurate bio
      let bio = "No bio set";
      if (status?.status && status.status.length > 0) {
        bio = status.status;
      }

      // Get last seen
      let lastSeen = "Hidden";
      if (user?.lastSeen) {
        lastSeen = new Date(user.lastSeen * 1000).toLocaleString();
      }

      // Prepare profile picture
      let ppImage;
      if (ppUrl) {
        try {
          const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
          ppImage = Buffer.from(response.data, 'binary');
        } catch (e) {
          console.log("Couldn't fetch profile picture");
        }
      }

      // Format profile info
      const profileInfo = `
📌 *USER PROFILE* 📌

👤 *Name:* ${username}
📝 *Bio:* ${bio}
🕒 *Last Active:* ${lastSeen}
🆔 *User ID:* ${targetUser.split('@')[0]}

_Profile fetched by Sarkar-MD_
      `;

      await m.React('✅'); // Success reaction

      // Send message
      const messageOptions = {
        caption: profileInfo,
        mentions: [targetUser],
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315182578784@newsletter',
            newsletterName: "Sarkar-MD",
            serverMessageId: -1,
          },
          externalAdReply: {
            title: "✨ Sarkar-MD Profile ✨",
            body: "Complete User Profile",
            thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/main/Pairing/1733805817658.webp',
            mediaType: 1,
          },
        },
      };

      if (ppImage) {
        await sock.sendMessage(
          m.from,
          { image: ppImage, ...messageOptions },
          { quoted: m }
        );
      } else {
        await sock.sendMessage(
          m.from,
          { text: profileInfo, ...messageOptions },
          { quoted: m }
        );
      }

    } catch (error) {
      console.error('Profile command error:', error);
      await m.React('❌');
      await sock.sendMessage(
        m.from,
        { text: "⚠️ Failed to fetch profile. The user may have privacy settings enabled." },
        { quoted: m }
      );
    }
  }
};

export default profile;
