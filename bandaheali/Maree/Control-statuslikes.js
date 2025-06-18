import Sarkar from '../../config.js';
import {getSetting, setSetting} from '../../lib/settings.js';

const likeCommand = async (m, Matrix) => {
  const dev = '923253617422@s.whatsapp.net';
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isCreator = [botNumber, Sarkar.OWNER_NUMBER + '@s.whatsapp.net', dev].includes(m.sender);
    const prefix = Sarkar.PREFIX;
const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
const text = m.body.slice(prefix.length + cmd.length).trim();


    if (cmd === 'statuslike' || cmd === "statusreact") {
        if (!isCreator) {
            await Matrix.sendMessage(m.from, { text: "*_📛 THIS IS AN OWNER COMMAND_*" }, { quoted: m });
            return;
        }

        if (['on', 'off'].includes(text)) {
            if (text === 'on') {
               Sarkar.AUTO_STATUS_REACT = ""true;
               setSetting('statuslike', true);
                m.reply(`*_Status React Activated SUCCESSFULLY NOW Bot will React on Status With Random Emoji_*`);
            } else if (text === 'private') {
                Sarkar.AUTO_STATUS_REACT = false;
                setSetting('statuslike', false);
            m.reply(`*_STATUS LIKES SUCCESSFULLY DEACTIVATED NOW BOT WILL NOT REACTS ON STATUSES_*`);
            } else {
                m.reply("Usage:\n.statuslike on/off");
            }
        } else {
            m.reply("Invalid Usage. Please use 'on' or 'off'.");
        }
    }
};

export default likeCommand;
