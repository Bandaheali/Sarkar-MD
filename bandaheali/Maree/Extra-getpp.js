import config from '../../config.js';
import { default as fetch } from 'node-fetch';

const getpp = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd !== 'getpp') return;

  try {
    // Determine target user with proper priority: reply > mention > command sender
    let targetUser = m.quoted?.sender 
      || (m.mentionedJid?.length ? m.mentionedJid[0] 
      : m.sender);

    // If someone is mentioned in the command (not just replied to)
    if (m.mentionedJid?.length && !m.quoted) {
      targetUser = m.mentionedJid[0];
    }

    // Normalize JID (ensure it's in correct format)
    targetUser = targetUser.includes('@') 
      ? targetUser.split('@')[0] + '@s.whatsapp.net' 
      : targetUser + '@s.whatsapp.net';

    // Check if user exists
    const check = await sock.onWhatsApp(targetUser);
    if (!check?.[0]?.exists) {
      return m.reply('❌ *This number is not on WhatsApp!*');
    }

    // Fetch profile picture
    let ppUrl;
    try {
      ppUrl = await sock.profilePictureUrl(targetUser, 'image');
    } catch {
      ppUrl = null;
    }

    if (!ppUrl) {
      return m.reply('❌ *Profile picture not found or is private!*');
    }

    // Download image
    let ppBuffer;
    try {
      const res = await fetch(ppUrl);
      if (!res.ok) throw new Error('Image fetch failed');
      ppBuffer = await res.buffer();
    } catch (err) {
      return m.reply('❌ *Failed to download profile picture!*');
    }

    // Get name and bio
    const name = (await sock.getName(targetUser)) || 'Unknown';
    let bio = 'No bio available';
    try {
      const status = await sock.fetchStatus(targetUser);
      bio = status?.status || bio;
    } catch {}

    // Send VIP-style message
    const caption = `
╭━━〔 *𝐕𝐈𝐏 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐋𝐎𝐎𝐊𝐔𝐏* 〕━━⬣
┃
┃ ✦ *Name:* ${name}
┃ ✦ *Bio:* ${bio}
┃ ✦ *Number:* wa.me/${targetUser.replace(/@.+/, '')}
┃
╰━━━━━━━━━━━━━━━━━━⬣
`.trim();

    await sock.sendMessage(
      m.from,
      {
        image: ppBuffer,
        caption,
        mentions: [targetUser]
      },
      { quoted: m }
    );
  } catch (e) {
    console.error('getpp error:', e);
    await m.reply('❌ *Internal error occurred while fetching profile picture.*');
  }
};

export default getpp;
