import axios from "axios";
import config from '../../config.cjs';
import fs from 'fs/promises';

const tempmail = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'tempmail') {
    await m.React('⏳');
    try {
      // Step 1: Get valid domain
      const domainRes = await axios.get("https://api.mail.tm/domains");
      const domain = domainRes.data?.hydra:member?.[0]?.domain;

      if (!domain) throw new Error("No valid domains found.");

      // Step 2: Generate random credentials
      const random = Math.random().toString(36).substring(2, 10);
      const email = `${random}@${domain}`;
      const password = `Sarkar@${random}`;

      // Step 3: Register
      await axios.post("https://api.mail.tm/accounts", { address: email, password });

      // Step 4: Login to get token
      const loginRes = await axios.post("https://api.mail.tm/token", { address: email, password });
      const token = loginRes.data.token;

      // Step 5: Save to file
      await fs.writeFile('./temp_mail.json', JSON.stringify({ email, password, token }));

      await sock.sendMessage(
        m.from,
        {
          text: `> *Temporary Email Created:*\n${email}\n\nUse *.inboxmail* to check inbox.`,
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999,
            externalAdReply: {
              title: "TempMail Created",
              body: "Powered by Mail.tm",
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

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message || '❌ Unknown error occurred.';

      await sock.sendMessage(
        m.from,
        {
          text: `*❌ TempMail Error:*\n${errorMessage}`,
        },
        { quoted: m }
      );

      await m.React('❌');
    }
  }
};

export default tempmail;
