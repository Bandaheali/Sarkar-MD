import { allFonts, stylize } from '../../lib/fonts.js'; // path adjust kro agar zarurat ho
import config from '../../config.js';
const testCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    if (cmd === 'test') {
      const fonts = Object.keys(allFonts);
      const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
      const msg = stylize('Hey! Sarkar MD is Alive.', randomFont);

      await sock.sendMessage(m.from, { text: msg }, { quoted: m });
    }
  } catch (err) {
    console.error('Test command error:', err);
    await sock.sendMessage(m.from, {
      text: `❌ *Error:* ${err.toString().substring(0, 150)}`
    }, { quoted: m });
  }
};

export default testCmd;
