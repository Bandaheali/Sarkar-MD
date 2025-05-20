import config from '../../config.js';

const forward = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
  
  
  if (["forward", "fwd"].includes(cmd)) {
    if (!owner.includes(m.sender)) return m.reply('Only owner can use this command');
  
    if (!m.quoted) return m.reply('Reply to a message to forward.');

    const args = m.body.split(' ').slice(1);
    if (args.length === 0) return m.reply('Provide a JID (group/number) to forward to.');

    const targetJid = args[0].includes('@') ? args[0] : `${args[0]}@s.whatsapp.net`;

    try {
      // Forward with newsletter style context
      await sock.sendMessage(
        targetJid,
        {
          forward: m.quoted,
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363315182578784@newsletter',
              newsletterName: "Sarkar-MD",
              serverMessageId: -1,
            },
            forwardingScore: 999,
            externalAdReply: {
              title: "✨ Sarkar-MD ✨",
              body: "Forwarded Message",
              thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/main/Pairing/1733805817658.webp',
              sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD',
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        },
        { quoted: m }
      );
      
      m.reply('Message forwarded successfully with newsletter style!');
    } catch (error) {
      m.reply('Failed to forward message.');
      console.error(error);
    }
  }
};

export default forward;
