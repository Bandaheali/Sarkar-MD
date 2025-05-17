import { getSetting } from '../../lib/settings.js';
import config from '../../config.js';

const checkCmd = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX;
    const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
    const dev = '923253617422@s.whatsapp.net';
    const bot = await Matrix.decodeJid(Matrix.user.id);
    const isCreater = [bot, dev, owner].includes(m.sender);
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    if (cmd === 'check') {
      if(!isCreater) return m.reply("*_THIS IS AN OWNER COMMAND_*");
      await m.React('⏳'); // Loading reaction

      // Get all settings keys
      const keys = ['welcome', 'chatbot', 'ping']; // add your keys here

      // Prepare response
      let response = '> *⚙️ CURRENT SETTINGS STATUS ⚙️*\n\n';
      keys.forEach(key => {
        const val = getSetting(key) ?? false;
        response += `▢ *${key.toUpperCase()}*: ${val ? '✅ Enabled' : '❌ Disabled'}\n`;
      });

      // Random emojis
      const emojis = ['✨', '⚡', '🔧', '⚙️', '🎛️', '🔌', '💡', '🔦', '🛠️', '📊'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

      await Matrix.sendMessage(
        m.from,
        {
          text: response + `\n${randomEmoji} *Bot Settings* ${randomEmoji}`,
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363315182578784@newsletter',
              newsletterName: "Sarkar-MD",
              serverMessageId: -1,
            },
            forwardingScore: 999,
            externalAdReply: {
              title: "⚙️ SARKAR-MD SETTINGS ⚙️",
              body: "Current Configuration Status",
              thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/main/Pairing/1733805817658.webp',
              sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD',
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        },
        { quoted: m }
      );

      await m.React('✅'); // Success reaction
    }
  } catch (error) {
    console.error('Check Command Error:', error);
    await m.React('❌'); // Error reaction
    await Matrix.sendMessage(m.from, { text: '*An error occurred while checking settings.*' }, { quoted: m });
  }
};

export default checkCmd;
