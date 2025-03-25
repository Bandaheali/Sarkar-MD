import config from '../../config.cjs';

const fancyStyles = [
  "⭐ *𝙎𝘼𝙍𝙆𝘼𝙍-𝙈𝘿 𝙎𝙋𝙀𝙀𝘿:* ⚡",
  "🚀 *ＳＡＲＫＡＲ-ＭＤ ＳＰＥＥＤ:* 💨",
  "🔥 *𝕊𝔸ℝ𝕂𝔸ℝ-𝕄𝔻 𝕊ℙ𝔼𝔼𝔻:* ⚡",
  "✨ *𝓢𝓐𝓡𝓚𝓐𝓡-𝓜𝓓 𝓢𝓟𝓔𝓔𝓓:* 🚀",
  "💎 *𝚂𝙰𝚁𝙺𝙰𝚁-𝙼𝙳 𝚂𝙿𝙴𝙴𝙳:* 🌟",
  "🔮 *Ｓａｒｋａｒ－ＭＤ Ｓｐｅｅｄ:* ⚡",
  "💥 *𝐒𝐀𝐑𝐊𝐀𝐑-𝐌𝐃 𝐒𝐏𝐄𝐄𝐃:* 🚀",
  "🌀 *ＳＡＲＫＡＲＭＤ ＳＰＥＥＤ:* ⚡",
  "🎯 *𝕊𝔸ℝ𝕂𝔸ℝ 𝕄𝔻 𝕊ℙ𝔼𝔼𝔻:* 💥",
  "⚡ *𝗦𝗔𝗥𝗞𝗔𝗥-𝗠𝗗 𝗦𝗣𝗘𝗘𝗗:* 🌪️",
  "💫 *𝘚𝘈𝘙𝘒𝘈𝘙-𝘔𝘋 𝘚𝘗𝘌𝘌𝘿:* 🚀",
  "🌟 *𝚂𝙰𝚁𝙺𝙰𝚁-𝙼𝙳 𝚂𝙿𝙴𝙴𝙳:* 🔥",
  "🔰 *ＳＡＲＫＡＲ －ＭＤ ＳＰＥＥＤ:* ⚡",
  "🛸 *𝒮𝒜𝑅𝒦𝒜𝑅-𝑀𝒟 𝒮𝒫𝐸𝐸𝒟:* 💨",
  "🌪️ *𝙎𝘼𝙍𝙆𝘼𝙍-𝙈𝘿 𝙎𝙋𝙀𝙴𝘿:* 💎"
];

const colors = [
  "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚫", "⚪", "🟡", "🔵", "🟣", "🔴"
];

const ping = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["ping", "speed", "p"].includes(cmd)) {
    const start = performance.now();
    await m.React('⚡'); // React with lightning icon

    const end = performance.now();
    const responseTime = (end - start).toFixed(2);

    // Random fancy text variant & color emoji
    const fancyText = fancyStyles[Math.floor(Math.random() * fancyStyles.length)];
    const colorEmoji = colors[Math.floor(Math.random() * colors.length)];

    const responseText = `${colorEmoji} *${fancyText}* *${responseTime}ms*`;

    await sock.sendMessage(
      m.from,
      {
        text: responseText,
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315182578784@newsletter',
            newsletterName: "Sarkar-MD",
            serverMessageId: -1,
          },
          forwardingScore: 999, // Score to indicate it has been forwarded
          externalAdReply: {
            title: "✨ Sarkar-MD ✨",
            body: "Ping Speed Calculation",
            thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp', // Thumbnail image
            sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork', // Source link
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      },
      { quoted: m }
    );

    await m.React('✅'); // Success reaction
  }
};

export default ping;
