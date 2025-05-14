import axios from 'axios';
import config from '../../config.cjs';

const stickerCommands = [
  'cry', 'kiss', 'kill', 'kick', 'hug', 'pat', 'lick', 'bite', 'yeet',
  'bully', 'bonk', 'wink', 'poke', 'nom', 'slap', 'smile', 'wave',
  'awoo', 'blush', 'smug', 'dance', 'happy', 'sad', 'cringe', 'cuddle',
  'shinobu', 'handhold', 'glomp', 'highfive'
];

const stickerCommandHandler = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    if (!m.body.startsWith(prefix)) return;

    const args = m.body.slice(prefix.length).trim().split(/\s+/);
    const cmd = args[0]?.toLowerCase();

    if (!stickerCommands.includes(cmd)) return;

    const packname = 'Sarkar-MD';
    const author = '';

    const res = await axios.get(`https://api.waifu.pics/sfw/${cmd}`);
    const imageUrl = res?.data?.url;

    if (!imageUrl) {
      return m.reply(`Sticker not found for command: *${cmd}*`);
    }

    await gss.sendImageAsSticker(m.from, imageUrl, m, { packname, author });
  } catch (err) {
    console.error('Sticker Command Error:', err);
    m.reply('Something went wrong while fetching the sticker.');
  }
};

export default stickerCommandHandler;
