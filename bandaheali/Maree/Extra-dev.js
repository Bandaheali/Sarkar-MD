import config from '../../config.js';

const DevCmd = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    if (cmd === 'dev') {
      const devName = 'Bandaheali';
      const devNumber = '923253617422';

      const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${devName}
TEL;type=CELL;type=VOICE;waid=${devNumber}:${devNumber}
END:VCARD`.trim();

      const caption = `*👨‍💻 Developer Info*\n\n` +
        `*Name:* ${devName}\n` +
        `*Number:* wa.me/${devNumber}\n\n` +
        `*🌐 Website:* https://www.bandaheali.site\n` +
        `*🐙 GitHub:* https://github.com/Sarkar-Bandaheali/\n` +
        `*🎵 TikTok:* @baadshahbaloch\n` +
        `*📸 Instagram:* @bandaheali`;

      await Matrix.sendMessage(m.from, {
        contacts: {
          displayName: devName,
          contacts: [{ vcard }]
        }
      }, { quoted: m });

      await Matrix.sendMessage(m.from, { text: caption }, { quoted: m });
    }
  } catch (err) {
    console.error('Dev Command Error:', err);
    await Matrix.sendMessage(m.from, {
      text: '*An error occurred while sending the developer contact.*'
    }, { quoted: m });
  }
};

export default DevCmd;
