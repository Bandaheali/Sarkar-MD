import { getSetting } from '../../lib/settings.js';
import config from '../../config.cjs';

const checkCmd = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    if (cmd === 'check') {
      // Get all settings keys you want to check
      const keys = ['welcome', 'chatbot']; // add your keys here

      let response = '*Current Settings Status:*\n\n';
      keys.forEach(key => {
        const val = getSetting(key) ?? false;
        response += `- *${key}*: ${val ? '✅ Enabled' : '❌ Disabled'}\n`;
      });

      await Matrix.sendMessage(m.from, { text: response }, { quoted: m });
    }
  } catch (error) {
    console.error('Check Command Error:', error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default checkCmd;
