import config from '../../config.cjs';
import fetch from 'node-fetch';

const gpt = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "gpt") {
    const query = m.body.slice(prefix.length + cmd.length).trim();
    if (!query) {
      return await sock.sendMessage(m.from, { text: "⚠️ *Usage:* `gpt <message>`\n💡 Example: `gpt Hello!`" }, { quoted: m });
    }

    await m.React('⏳'); // React with a loading icon

    try {
      const apiUrl = `https://apis.giftedtech.web.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(query)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success) {
        await sock.sendMessage(
          m.from,
          {
            text: `🤖 *GPT-4 Response:*\n${data.result}`,
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardingScore: 999,
              externalAdReply: {
                title: "🤖 Sarkar-MD GPT-4",
                body: "Chat with GPT-4 AI",
                thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
                sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD',
                mediaType: 1,
                renderLargerThumbnail: false,
              },
            },
          },
          { quoted: m }
        );
        await m.React('✅'); // React with success
      } else {
        await sock.sendMessage(m.from, { text: "⚠️ GPT-4 response failed!" }, { quoted: m });
        await m.React('❌'); // React with error
      }
    } catch (error) {
      await sock.sendMessage(m.from, { text: "⚠️ API Error! Please try again later." }, { quoted: m });
      await m.React('❌'); // React with error
    }
  }
};

export default gpt;
