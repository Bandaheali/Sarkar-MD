import config from '../../config.cjs';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const getpp = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd !== 'getpp') return;

  try {
    // Get target user (sender, mentioned, or quoted)
    let targetUser = m.sender;
    if (m.quoted?.sender) targetUser = m.quoted.sender;
    else if (m.mentionedJid?.length) targetUser = m.mentionedJid[0];

    // Remove @ suffix from JID if it exists
    targetUser = targetUser.replace(/@.+/, '') + '@s.whatsapp.net';

    // Fetch profile picture and user data
    const [ppUrl, userInfo] = await Promise.all([
      sock.profilePictureUrl(targetUser, 'image').catch(() => null),
      sock.onWhatsApp(targetUser).catch(() => null)
    ]);

    if (!userInfo || !userInfo.length) {
      return m.reply('❌ User not found on WhatsApp!');
    }

    if (!ppUrl) {
      return m.reply('❌ Profile picture not available!');
    }

    // Download profile picture buffer
    const ppBuffer = await (await fetch(ppUrl)).arrayBuffer();

    // Get contact details
    const contact = await sock.contact.getContact(targetUser, { force: true });
    const name = contact.notify || contact.name || 'Unknown';
    const bio = contact.status || 'No bio';

    // VIP-style caption
    const caption = `
╭───「 *PROFILE INFO* 」───
│ 👤 *Name:* ${name}
│ 📝 *Bio:* ${bio}
│ ☎️ *Number:* wa.me/${targetUser.replace(/@.+/, '')}
╰───────────────────────
    `.trim();

    // Send profile picture with caption
    await sock.sendMessage(
      m.from,
      {
        image: Buffer.from(ppBuffer),
        caption,
        mentions: [targetUser]
      },
      { quoted: m }
    );

  } catch (err) {
    console.error('GETPP ERROR:', err);
    await m.reply('❌ An error occurred while fetching the profile picture.');
  }
};

export default getpp;
