import config from '../../config.cjs';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const getpp = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) 
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === 'getpp') {
    try {
      // Get the target user (either quoted/mentioned or sender)
      let targetUser = m.sender;
      if (m.quoted) {
        targetUser = m.quoted.sender;
      } else if (m.mentionedJid && m.mentionedJid[0]) {
        targetUser = m.mentionedJid[0];
      }

      // Remove @ from JID if present
      targetUser = targetUser.replace(/@.+/, '');

      // Get user's profile picture and info
      const [profilePicture, userInfo] = await Promise.all([
        sock.profilePictureUrl(targetUser, 'image').catch(() => null),
        sock.onWhatsApp(targetUser).catch(() => null)
      ]);

      if (!profilePicture) {
        return m.reply('❌ Could not fetch profile picture!');
      }

      // Download the profile picture
      const ppBuffer = await (await fetch(profilePicture)).buffer();

      // Get user's name and status (bio)
      const contact = await sock.contact.getContact(targetUser, {
        force: true
      });
      const userName = contact.notify || contact.name || 'Unknown';
      const userBio = contact.status || 'No bio';

      // Format the caption
      const caption = `
👤 *Name:* ${userName}
📝 *Bio:* ${userBio}
📞 *Number:* ${targetUser.split('@')[0]}
      `.trim();

      // Send the profile picture with caption
      await sock.sendMessage(
        m.from,
        {
          image: ppBuffer,
          caption: caption,
          mentions: [targetUser]
        },
        { quoted: m }
      );

    } catch (error) {
      console.error('Error in getpp command:', error);
      m.reply('❌ Error fetching profile picture!');
    }
  }
};

export default getpp;
