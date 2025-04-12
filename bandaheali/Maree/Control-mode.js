import config from '../../config.cjs';

const recodingCommand = async (m, Matrix) => {
  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const dev = '923253617422@s.whatsapp.net'; // Your VIP number
    const isAuthorized = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'mode') {
      if (!isAuthorized) return m.reply('*_This command is only for the bot and owner_*');
      if(!text) return m.reply('*_GIVE ME A TEXT PUBLIC OR PRIVATE_*');
      if (!['public', 'private'].includes(text)) return m.reply('*_PLEAZE ONLY USE `public` or `private`');

      let responseMessage;
config.MODE = text;
      responseMsg = `*_MODE CHANGED SUCCESSFULLY NOW I AM IN ${mode} MODE*_`;

      await Matrix.sendMessage(m.from, { text: responseMsg }, { quoted: m });
    }
  } catch (error) {
    console.error("Auto Recodinf Command Error:", error);
    await Matrix.sendMessage(m.from, { text: '*An error occurred while processing your request.*' }, { quoted: m });
  }
};

export default recodingCommand;
