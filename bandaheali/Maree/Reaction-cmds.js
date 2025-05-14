import axios from 'axios';
import config from '../../config.cjs';
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child-exec-promise';

const gifCommandHandler = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) 
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() 
    : '';
  const mentionedUser = m.mentionedIds?.[0] || '';

  const actionCommands = [
    'cry', 'kiss', 'kill', 'kick', 'hug', 'pat', 'lick', 'bite', 
    'yeet', 'bully', 'bonk', 'wink', 'poke', 'nom', 'slap', 'smile', 
    'wave', 'awoo', 'blush', 'smug', 'dance', 'happy', 'sad', 
    'cringe', 'cuddle', 'shinobu', 'handhold', 'glomp', 'highfive'
  ];

  if (actionCommands.includes(cmd)) {
    try {
      // VIP loading reaction
      await m.React('🎬');
      
      // Fetch GIF from API
      const { data } = await axios.get(`https://api.waifu.pics/sfw/${cmd}`);
      
      if (!data?.url) {
        await m.React('❌');
        return await m.reply('*Error:* No GIF URL received from API');
      }

      // Download GIF
      const res = await fetch(data.url);
      const gifBuffer = await res.buffer();
      
      // Save temporary file
      const tempPath = `./temp_${Date.now()}.gif`;
      fs.writeFileSync(tempPath, gifBuffer);
      
      // Convert to MP4 for better WhatsApp playback
      const outputPath = tempPath.replace('.gif', '.mp4');
      await exec(`ffmpeg -i ${tempPath} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${outputPath}`);
      
      // Read converted file
      const videoBuffer = fs.readFileSync(outputPath);
      
      // Determine caption based on mentions
      let caption = `@${m.sender.split('@')[0]} ${cmd}`;
      if (mentionedUser) {
        caption += ` @${mentionedUser.split('@')[0]}`;
      }
      
      // Send as animated GIF
      await sock.sendMessage(
        m.from,
        {
          video: videoBuffer,
          gifPlayback: true,
          caption: caption,
          mentions: [m.sender, ...(mentionedUser ? [mentionedUser] : [])],
          contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            externalAdReply: {
              title: `🎥 ${cmd.toUpperCase()} GIF`,
              body: "SARKAR-MD VIP ACTION",
              thumbnailUrl: 'https://i.imgur.com/J1vXyQD.png',
              mediaType: 1
            }
          }
        },
        { quoted: m }
      );
      
      // Cleanup temp files
      fs.unlinkSync(tempPath);
      fs.unlinkSync(outputPath);
      
      // VIP success reaction
      await m.React('🎉');
      
      // 25% chance for bonus VIP reaction
      if (Math.random() < 0.25) {
        await m.React(['💎', '👑', '✨'][Math.floor(Math.random() * 3)]);
      }
      
    } catch (error) {
      console.error('GIF Command Error:', error);
      await m.React('❌');
      await m.reply(`*VIP Error:*\n${error.message}`);
    }
  }
};

export default gifCommandHandler;
