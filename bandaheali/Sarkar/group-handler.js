import moment from 'moment-timezone';
import config from '../../config.cjs';

export default async function GroupParticipants(sock, { id, participants, action }) {
  try {
    const metadata = await sock.groupMetadata(id);
    const ownerJid = metadata.owner || metadata.participants.find(p => p.admin === 'superadmin')?.id;
    const ownerName = ownerJid ? `@${ownerJid.split("@")[0]}` : 'Unknown';

    for (const jid of participants) {
      // Get profile picture
      let profile;
      try {
        profile = await sock.profilePictureUrl(jid, "image");
      } catch {
        profile = "https://lh3.googleusercontent.com/proxy/esjjzRYoXlhgNYXqU8Gf_3lu6V-eONTnymkLzdwQ6F6z0MWAqIwIpqgq_lk4caRIZF_0Uqb5U8NWNrJcaeTuCjp7xZlpL48JDx-qzAXSTh00AVVqBoT7MJ0259pik9mnQ1LldFLfHZUGDGY=w1200-h630-p-k-no-nu";
      }

      const userName = jid.split("@")[0];
      const time = moment.tz('Asia/Karachi').format('HH:mm:ss');
      const date = moment.tz('Asia/Karachi').format('DD/MM/YYYY');
      const membersCount = metadata.participants.length;

      if (action === "add" && config.WELCOME) {
        await sock.sendMessage(id, {
          text:
            `╭─────「 ✦ 𝙒𝙀𝙇𝘾𝙊𝙈𝙀 ✦ 」─────╮\n` +
            `│ 🎉 Hello @${userName}, welcome to *${metadata.subject}*!\n` +
            `│\n` +
            `├➤ Joined: ${time} on ${date}\n` +
            `├➤ Member #: ${membersCount}\n` +
            `├➤ Group Creator: ${ownerName}\n` +
            `├➤ Handler: Bandaheali\n` +
            `└➤ Bot: *Sarkar-MD*\n\n` +
            `_Feel free to introduce yourself and enjoy your stay!_\n\n` +
            `*~ Powered by Sarkar-MD*`,
          contextInfo: {
            mentionedJid: [jid, ownerJid],
            externalAdReply: {
              title: `✨ Welcome to ${metadata.subject}`,
              body: `@${userName} just joined the group!`,
              mediaType: 1,
              previewType: 0,
              renderLargerThumbnail: true,
              thumbnailUrl: profile,
              sourceUrl: 'https://techbybandali.blogspot.com'
            }
          }
        });
      }

      if (action === "remove" && config.WELCOME) {
        await sock.sendMessage(id, {
          text:
            `╭─────「 ❌ 𝙇𝙀𝘼𝙑𝙀 𝘼𝙇𝙀𝙍𝙏 」─────╮\n` +
            `│ Goodbye @${userName}, you left *${metadata.subject}*.\n` +
            `│\n` +
            `├➤ Time: ${time}\n` +
            `├➤ Date: ${date}\n` +
            `├➤ Remaining Members: ${membersCount}\n` +
            `└➤ Group Creator: ${ownerName}\n\n` +
            `*~ Powered by Sarkar-MD*`,
          contextInfo: {
            mentionedJid: [jid, ownerJid],
            externalAdReply: {
              title: `👋 Member Left`,
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
    console.error('GroupParticipants Error:', e);
  }
          }
