import axios from 'axios';
import config from '../../config.cjs';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import Crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegPath.path);

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

    const sender = `@${m.sender.split('@')[0]}`;
    const mentionedUser = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender);
    const isGroup = m.isGroup;

    const message = mentionedUser
      ? `${sender} is ${cmd}ing @${mentionedUser.split('@')[0]}`
      : isGroup
      ? `${sender} is ${cmd}ing!`
      : `> ⚡ Powered By 𝗠𝗔𝗦𝗧𝗘𝗥-𝗠𝗗`;

    const apiUrl = `https://api.waifu.pics/sfw/${cmd}`;
    const res = await axios.get(apiUrl);
    const gifUrl = res.data.url;

    const gifBuffer = await fetchGif(gifUrl);
    const videoBuffer = await gifToVideo(gifBuffer);

    await gss.sendMessage(
      m.from,
      {
        video: videoBuffer,
        caption: message,
        gifPlayback: true,
        mentions: [m.sender, mentionedUser].filter(Boolean),
      },
      { quoted: m }
    );
  } catch (err) {
    console.error(`❌ Error in .${cmd} command:`, err);
    m.reply(`❌ *Error:*\n\`\`\`${err.message}\`\`\``);
  }
};

// Helper to fetch GIF buffer
async function fetchGif(url) {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching GIF:', error);
    throw new Error('Could not fetch GIF.');
  }
}

// Helper to convert GIF to MP4 video buffer
async function gifToVideo(gifBuffer) {
  const filename = Crypto.randomBytes(6).toString('hex');
  const gifPath = path.join(tmpdir(), `${filename}.gif`);
  const mp4Path = path.join(tmpdir(), `${filename}.mp4`);

  fs.writeFileSync(gifPath, gifBuffer);

  await new Promise((resolve, reject) => {
    ffmpeg(gifPath)
      .outputOptions([
        '-movflags faststart',
        '-pix_fmt yuv420p',
        '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2'
      ])
      .on('error', err => {
        console.error('❌ ffmpeg conversion error:', err);
        reject(new Error('Could not convert GIF to video.'));
      })
      .on('end', resolve)
      .save(mp4Path);
  });

  const videoBuffer = fs.readFileSync(mp4Path);
  fs.unlinkSync(gifPath);
  fs.unlinkSync(mp4Path);
  return videoBuffer;
}

export default stickerCommandHandler;
