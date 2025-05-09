import axios from "axios";
import config from '../../config.cjs';

const tempmail = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'tempmail') {
    await m.React('⏳');
    try {
      // Generate random email (1secmail API doesn't require registration)
      const domains = ['1secmail.com', '1secmail.net', '1secmail.org'];
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const randomName = Math.random().toString(36).substring(2, 10);
      const email = `${randomName}@${randomDomain}`;

      await sock.sendMessage(
        m.from,
        {
          text: `> *Temporary Email Created:*\n${email}\n\nUse *.inboxmail* to check messages.\n\nThis email will expire after 1 hour.`,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: "TempMail Created",
              body: "Powered by 1secmail",
              thumbnailUrl: 'https://i.imgur.com/6Qf9Z3A.png',
              sourceUrl: 'https://www.1secmail.com/',
            },
          },
        },
        { quoted: m }
      );

      await m.React('✅');
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.from, { text: `*❌ Failed to generate tempmail. ${err}*` }, { quoted: m });
      await m.React('❌');
    }
  }
};

export default tempmail;
