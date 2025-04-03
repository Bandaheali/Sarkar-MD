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
      
      // Get basic contact info first
      const contact = await sock.onWhatsApp(targetUser);
      if (!contact || !contact[0]?.exists) {
        throw new Error("User not found");
      }

      const username = contact[0]?.name || contact[0]?.pushname || targetUser.split('@')[0];
      
      // Try to get profile picture (may fail due to privacy)
      let ppUrl;
      try {
        ppUrl = await sock.profilePictureUrl(targetUser, 'image');
      } catch {
        ppUrl = null;
      }

      // Try to get status (may fail due to privacy)
      let bio = "Bio hidden by user";
      try {
        const status = await sock.fetchStatus(targetUser);
        if (status?.status?.trim()) {
          bio = status.status;
        }
      } catch {}

      // Format profile info
      const profileInfo = `
📌 *USER PROFILE* 📌

👤 *Name:* ${username}
📝 *Bio:* ${bio}
🆔 *User ID:* ${targetUser.split('@')[0]}

_Profile fetched by Sarkar-MD_
      `;

      await m.React('✅'); // Success reaction

      // Prepare message with or without profile picture
      const messageOptions = {
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
            body: "User Profile Information",
            thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/main/Pairing/1733805817658.webp',
            mediaType: 1,
          },
        },
      };

      if (ppUrl) {
        try {
          const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
          await sock.sendMessage(
            m.from,
            { 
              image: Buffer.from(response.data),
              caption: profileInfo,
              ...messageOptions 
            },
            { quoted: m }
          );
          return;
        } catch (e) {
          console.log("Couldn't fetch profile picture");
        }
      }

      // Fallback to text-only if no picture
      await sock.sendMessage(
        m.from,
        { 
          text: `${username} doesn't have a visible profile picture\n\n${profileInfo}`,
          ...messageOptions 
        },
        { quoted: m }
      );

    } catch (error) {
      console.error('Profile command error:', error);
      await m.React('❌');
      let errorMsg = "⚠️ Failed to fetch profile.";
      
      if (error.message.includes("not found") || error.message.includes("privacy")) {
        errorMsg = "⚠️ Profile information is hidden by user's privacy settings.";
      }
      
      await sock.sendMessage(
        m.from,
        { text: errorMsg },
        { quoted: m }
      );
    }
  }
};

export default profile;
