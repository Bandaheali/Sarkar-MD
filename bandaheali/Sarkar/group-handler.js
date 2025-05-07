import moment from 'moment-timezone';
import config from '../../config.cjs';

export default async function GroupParticipants(sock, { id, participants, action }) {
  try {
    const metadata = await sock.groupMetadata(id);

    for (const jid of participants) {
      let profile;
      try {
        profile = await sock.profilePictureUrl(jid, "image");
      } catch {
        profile = "https://i.ibb.co/S5B1k8Z/default.jpg"; // fallback image
      }

      const userName = jid.split('@')[0];
      const time = moment.tz('Asia/Karachi').format('HH:mm:ss');
      const date = moment.tz('Asia/Karachi').format('DD/MM/YYYY');
      const membersCount = metadata.participants.length;

      if (action === "add" && config.WELCOME) {
        await sock.sendMessage(id, {
          text: `🎉 *Welcome @${userName}!* 🎉\n\n👤 Name: @${userName}\n📛 Group: *${metadata.subject}*\n🔢 Member No: *${membersCount}*\n⏰ Joined at: *${time}* on *${date}*\n\n_*Enjoy your stay!*_`,
          contextInfo: {
            mentionedJid: [jid],
            externalAdReply: {
              title: `✨ Welcome to ${metadata.subject}!`,
              body: `@${userName} joined the party!`,
              mediaType: 1,
              previewType: 0,
              renderLargerThumbnail: true,
              thumbnailUrl: profile,
              sourceUrl: 'https://techbybandali.blogspot.com'
            }
          }
        });
      }

      else if (action === "remove" && config.WELCOME) {
        await sock.sendMessage(id, {
          text: `👋 *Goodbye @${userName}!* 👋\n\n📛 Group: *${metadata.subject}*\n👥 Members Left: *${membersCount}*\n⏰ Left at: *${time}* on *${date}*\n\n_*We’ll miss you!*_`,
          contextInfo: {
            mentionedJid: [jid],
            externalAdReply: {
              title: `👋 Left ${metadata.subject}`,
              body: `@${userName} has left the group.`,
              mediaType: 1,
              previewType: 0,
              renderLargerThumbnail: true,
              thumbnailUrl: profile,
              sourceUrl: 'https://techbybandali.blogspot.com'
            }
          }
        });
      }
    }
  } catch (e) {
    console.error("Error in GroupParticipants handler:", e);
  }
}
