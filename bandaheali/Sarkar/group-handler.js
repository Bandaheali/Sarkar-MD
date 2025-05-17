import moment from 'moment-timezone';
import config from '../../config.js';
import { getSetting } from '../../lib/settings.js';
export default async function GroupParticipants(sock, { id, participants, action }) {
  try {
    const metadata = await sock.groupMetadata(id);
    const ownerJid = metadata.owner || metadata.participants.find(p => p.admin === 'superadmin')?.id;
    const ownerName = ownerJid ? `@${ownerJid.split("@")[0]}` : 'Unknown';

    for (const jid of participants) {
      let profile;
      try {
        profile = await sock.profilePictureUrl(jid, "image");
      } catch {
        profile = "https://i.ibb.co/album/default-profile.png";
      }

      const userName = jid.split("@")[0];
      const time = moment.tz('Asia/Karachi').format('HH:mm:ss');
      const date = moment.tz('Asia/Karachi').format('DD/MM/YYYY');
      const membersCount = metadata.participants.length;

      if (action === "add" && getSetting('welcome')) {
        await sock.sendMessage(id, {
          text:
            `╭───〔 ✨ *WELCOME* ✨ 〕───╮\n` +
            `👋 *Hey @${userName}*, welcome to *${metadata.subject}*!\n` +
            `🌟 We're thrilled to have you join us.\n\n` +
            `🕒 *Time:* ${time}\n` +
            `📆 *Date:* ${date}\n` +
            `👥 *Member #:* ${membersCount}\n` +
            `⭐ *Group Creator:* ${ownerName}\n\n` +
            `💬 *Please introduce yourself & start vibing!*\n` +
            `⚠️ *Must follow the group rules for a great experience!*\n\n` +
            `*~ Powered by Sarkar-MD*`,
          contextInfo: {
            mentionedJid: [jid, ownerJid],
            externalAdReply: {
              title: `Welcome @${userName}!`,
              body: `Enjoy your stay in ${metadata.subject}!`,
              mediaType: 1,
              previewType: 0,
              renderLargerThumbnail: true,
              thumbnailUrl: profile,
              sourceUrl: 'https://www.Bandaheali.site'
            }
          }
        });
      }

      if (action === "remove" && getSetting('welcome')) {
        await sock.sendMessage(id, {
          text:
            `╭──〔 😢 *GOODBYE ALERT* 😢 〕──╮\n` +
            `💔 *@${userName} has left* *${metadata.subject}*.\n` +
            `🕒 *Time:* ${time} | 📆 *Date:* ${date}\n` +
            `👥 *Remaining Members:* ${membersCount}\n` +
            `⭐ *Group Creator:* ${ownerName}\n\n` +
            `😞 We’ll miss you a lot, @${userName}.\n` +
            `🌈 Wishing you the best wherever you go!\n\n` +
            `*~ Powered by Sarkar-MD*`,
          contextInfo: {
            mentionedJid: [jid, ownerJid],
            externalAdReply: {
              title: `Farewell @${userName}`,
              body: `Left the group. We’ll miss you!`,
              mediaType: 1,
              previewType: 0,
              renderLargerThumbnail: true,
              thumbnailUrl: profile,
              sourceUrl: 'https://www.Bandaheali.site'
            }
          }
        });
      }
    }
  } catch (e) {
    console.error('GroupParticipants Error:', e);
  }
              }
