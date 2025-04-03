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

      // Check if someone is mentioned
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
      const userContact = await sock.onWhatsApp(targetUser);
      const userProfile = await sock.profilePictureUrl(targetUser, 'image').catch(() => null);
      const status = await sock.fetchStatus(targetUser).catch(() => null);

      // Get user info
      const username = userContact[0]?.name || userContact[0]?.pushname || "Unknown User";
      const bio = status?.status || "No bio set";
      const lastSeen = status?.setAt ? new Date(status.setAt).toLocaleString() : "Hidden";
      const jid = targetUser.split('@')[0];

      // Prepare profile picture
      let ppImage;
      if (userProfile) {
        const response = await axios.get(userProfile, { responseType: 'arraybuffer' });
        ppImage = Buffer.from(response.data, 'binary');
      }

      // Format profile info
      const profileInfo = `
📌 *USER PROFILE* 📌

👤 *Name:* ${username}
🆔 *JID:* ${jid}
📝 *Bio:* ${bio}
🕒 *Last Seen:* ${lastSeen}

_Profile fetched by Sarkar-MD_
      `;

      await m.React('✅'); // Success reaction

      // Send message with or without profile picture
      if (ppImage) {
        await sock.sendMessage(
          m.from,
          {
            image: ppImage,
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
                body: "User Profile Fetcher",
                thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/main/Pairing/1733805817658.webp',
                mediaType: 1,
              },
            },
          },
          { quoted: m }
        );
      } else {
        await sock.sendMessage(
          m.from,
          {
            text: `*${username}* has no profile picture!\n\n${profileInfo}`,
            mentions: [targetUser],
            contextInfo: {
              isForwarded: true,
              // ... same contextInfo as above
            },
          },
          { quoted: m }
        );
      }

    } catch (error) {
      console.error('Profile command error:', error);
      await m.React('❌');
      await sock.sendMessage(
        m.from,
        { text: "⚠️ Failed to fetch profile. Try again later!" },
        { quoted: m }
      );
    }
  }
};

export default profile;
