import axios from "axios";
import config from '../../config.cjs';
import fs from 'fs/promises'; // For saving token (optional)

const tempmail = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'tempmail') {
    await m.React('⏳');
    try {
      // Step 1: Generate random credentials
      const random = Math.random().toString(36).substring(2, 10);
      const email = `${random}@mail.tm`;
      const password = `Sarkar@${random}`;

      // Step 2: Register
      await axios.post("https://api.mail.tm/accounts", { address: email, password });

      // Step 3: Login to get token
      const loginRes = await axios.post("https://api.mail.tm/token", { address: email, password });
      const token = loginRes.data.token;

      // Optional: save token locally (in memory, db or file)
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
    err.response?.data?.message || // Mail.tm error messages
    err.response?.data?.detail || // Some APIs use 'detail'
    err.message || // Fallback error
    '❌ Unknown error occurred.';

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
