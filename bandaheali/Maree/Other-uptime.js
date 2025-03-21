import config from '../../config.cjs';

const botStartTime = Date.now(); // Bot start time stored when script runs

const formatUptime = (ms) => {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds %= 60;
  minutes %= 60;

  return `${hours}h ${minutes}m ${seconds}s`;
};

const uptime = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "uptime") {
    const uptimeValue = formatUptime(Date.now() - botStartTime); // Calculate uptime once

    let sentMsg = await sock.sendMessage(m.from, { text: "𝐔" }, { quoted: m });

    // Step-by-step edit
    await new Promise(resolve => setTimeout(resolve, 500));
    await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐔𝐩" });

    await new Promise(resolve => setTimeout(resolve, 500));
    await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐔𝐩𝐓" });

    await new Promise(resolve => setTimeout(resolve, 500));
    await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐔𝐩𝐓𝐢" });

    await new Promise(resolve => setTimeout(resolve, 500));
    await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐔𝐩𝐓𝐢𝐦" });

    await new Promise(resolve => setTimeout(resolve, 500));
    await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐔𝐩𝐓𝐢𝐦𝐞" });


    // Send External Ad Reply with final uptime
    await sock.sendMessage(
      m.from,
      {
        text: `⏳ *𝐈 𝐀𝐦 𝐑𝐮𝐧𝐢𝐧𝐠 𝐅𝐫𝐨𝐦:* ${uptimeValue}`,
        contextInfo: {
          externalAdReply: {
            title: "Sarkar-MD Uptime",
            body: `Bot has been running for: ${uptimeValue}`,
            thumbnailUrl: "https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp",
            sourceUrl: "https://github.com/Sarkar-Bandaheali/Sarkar-MD",
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      },
      { quoted: m }
    );
  }
};

export default uptime;
