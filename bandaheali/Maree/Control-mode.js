import Sarkar from '../../config.js';
import {getSetting, setSetting} from '../../lib/settings.js';

const modeCommand = async (m, Matrix) => {
  const dev = '923253617422@s.whatsapp.net';
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isCreator = [botNumber, Sarkar.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);
    const prefix = Sarkar.PREFIX;
const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
const text = m.body.slice(prefix.length + cmd.length).trim();


    if (cmd === 'mode') {
        if (!isCreator) {
            await Matrix.sendMessage(m.from, { text: "*_📛 THIS IS AN OWNER COMMAND_*" }, { quoted: m });
            return;
        }

        if (['public', 'private'].includes(text)) {
            if (text === 'public') {
               setSetting('mode', "public");
                m.reply(`*_MODE CHANGED SUCCESSFULLY NOW I AM IN ${text} MODE_*`);
            } else if (text === 'private') {
                Matrix.public = false;
                Sarkar.MODE = "private";
                setSetting('mode', "private");
            m.reply(`*_MODE CHANGED SUCCESSFULLY NOW I AM IN ${text} MODE_*`);
            } else {
                m.reply("Usage:\n.Mode public/private");
            }
        } else {
            m.reply("Invalid mode. Please use 'public' or 'private'.");
        }
    }
};

export default modeCommand;
