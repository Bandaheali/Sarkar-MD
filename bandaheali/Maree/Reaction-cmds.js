import axios from 'axios';
import config from '../../config.cjs';

const stickerCommandHandler = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) 
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() 
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const stickerCommands = [
    'cry', 'kiss', 'kill', 'kick', 'hug', 'pat', 'lick', 'bite', 
    'yeet', 'bully', 'bonk', 'wink', 'poke', 'nom', 'slap', 'smile', 
    'wave', 'awoo', 'blush', 'smug', 'dance', 'happy', 'sad', 
    'cringe', 'cuddle', 'shinobu', 'handhold', 'glomp', 'highfive'
  ];

  if (stickerCommands.includes(cmd)) {
    const packname = `Sarkar-MD`;
    const author = '';

    try {
      await m.React('⏳'); // Show loading reaction
      
      const { data } = await axios.get(`https://api.waifu.pics/sfw/${cmd}`);
      
      if (data?.url) {
        await sock.sendMessage(
          m.from, 
          { 
            sticker: { url: data.url },
            contextInfo: {
              mentionedJid: [m.sender],
              forwardingScore: 999,
              isForwarded: true
            }
          },
          { quoted: m }
        );
        await m.React('✅'); // Success reaction
      } else {
        await m.React('❌');
        await m.reply('Error: No sticker URL received from API');
      }
    } catch (error) {
      console.error('Sticker Error:', error);
      await m.React('❌');
      await m.reply(`Error fetching sticker: ${error.message}`);
    }
  }
};

export default stickerCommandHandler;
