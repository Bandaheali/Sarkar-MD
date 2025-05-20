import config from '../../config.js';

const jid = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  const dev = '923253617422@s.whatsapp.net';
  const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
  const bot = typeof sock.user.id === 'string' ? sock.user.id : sock.decodeJid(sock.user.id);
  const owners = [dev, owner, bot];

  // Inline function for fancy reply
  const sendFancyReply = async (responseText) => {
    await sock.sendMessage(
      m.from,
      {
        text: responseText,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315182578784@newsletter',
            newsletterName: 'Sarkar-MD',
            serverMessageId: -1,
          },
          externalAdReply: {
            title: '✨ Sarkar-MD ✨',
            body: 'Powered by Sarkar-Bandaheali',
            thumbnailUrl:
              'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
            sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork',
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      },
      { quoted: m }
    );
  };

  if (cmd !== 'jid') return;

  if (!owners.includes(m.sender)) {
    return await sendFancyReply('Only the bot owner or developer can use this command.');
  }

  const targetJid = m.quoted ? m.quoted.sender : m.chat;
  const isGroup = targetJid.endsWith('@g.us');

  const response = `*JID Info:*\n${isGroup ? 'Group JID' : 'User JID'}: \n\`\`\`${targetJid}\`\`\``;

  await sendFancyReply(response);
};

export default jid;
