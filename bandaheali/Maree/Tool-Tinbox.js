import axios from "axios";
import fs from "fs/promises";
import config from '../../config.cjs';

const inboxmail = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'inboxmail') {
    await m.React('📥');

    try {
      const file = await fs.readFile('./temp_mail.json', 'utf8');
      const { token, email } = JSON.parse(file);

      const inboxRes = await axios.get("https://api.mail.tm/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const messages = inboxRes.data["hydra:member"];

      if (messages.length === 0) {
        return await sock.sendMessage(m.from, { text: `*📭 Inbox is empty for:* ${email}` }, { quoted: m });
      }

      const latest = messages[0];

      await sock.sendMessage(
        m.from,
        {
          text: `> *Inbox for:* ${email}\n\n*From:* ${latest.from.address}\n*Subject:* ${latest.subject}\n*Preview:* ${latest.intro}`,
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999,
            externalAdReply: {
              title: "Inbox Mail",
              body: "Latest message fetched",
              thumbnailUrl: 'https://avatars.githubusercontent.com/u/58938666',
              sourceUrl: 'https://mail.tm/',
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        },
        { quoted: m }
      );

      await m.React('✅');
    } catch (err) {
      console.error(err.response?.data || err);
      await sock.sendMessage(m.from, { text: '*❌ Failed to read inbox.*' }, { quoted: m });
      await m.React('❌');
    }
  }
};

export default inboxmail;
