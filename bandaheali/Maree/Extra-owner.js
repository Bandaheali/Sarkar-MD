import config from '../../config.js';

const OwnerCmd = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    if (cmd === 'owner') {
      const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${config.OWNER_NAME}
TEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:${config.OWNER_NUMBER}
END:VCARD`.trim();

      await Matrix.sendMessage(m.from, {
        contacts: {
          displayName: config.OWNER_NAME,
          contacts: [{ vcard }]
        }
      }, { quoted: m });
    }
  } catch (err) {
    console.error('Owner Command Error:', err);
    await Matrix.sendMessage(m.from, {
      text: '*An error occurred while sending the owner contact.*'
    }, { quoted: m });
  }
};

export default OwnerCmd;
