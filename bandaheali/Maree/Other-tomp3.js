import axios from 'axios';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import config from '../../config.cjs';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

const videoToMp3 = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['tomp3', 'video2mp3', 'extractaudio'];

  if (!validCommands.includes(cmd)) return;

  try {
    if (!m.isMedia && !m.isQuotedMedia) {
      return m.reply('Please send or reply to a video with this command.');
    }

    // Download the video
    const media = m.isQuotedMedia ? await m.getQuotedMessage() : m;
    if (!media.isMedia) {
      return m.reply('No video found. Please send or reply to a video.');
    }

    const videoData = await media.downloadMedia();
    const inputPath = `./temp/${media.id}.mp4`;
    const outputPath = `./temp/${media.id}.mp3`;

    await writeFileAsync(inputPath, videoData.data, 'base64');

    // Convert to MP3 using ffmpeg
    const command = `ffmpeg -i ${inputPath} -vn -ar 44100 -ac 2 -b:a 192k -f mp3 ${outputPath}`;
    
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg error:', error);
          reject(new Error('Failed to convert video to MP3'));
        }
        resolve();
      });
    });

    // Read the converted MP3
    const mp3Data = fs.readFileSync(outputPath);
    const base64Mp3 = mp3Data.toString('base64');

    // Send the MP3
    await gss.sendMessage(
      m.from,
      {
        audio: Buffer.from(base64Mp3, 'base64'),
        mimetype: 'audio/mpeg',
        ptt: false
      },
      { quoted: m }
    );

    // Clean up
    await unlinkAsync(inputPath);
    await unlinkAsync(inputPath + '.jpg'); // Remove potential thumbnail
    await unlinkAsync(outputPath);

  } catch (error) {
    console.error('Video to MP3 error:', error);
    m.reply('An error occurred while converting the video to MP3. Make sure FFmpeg is installed on the server.');
  }
};

export default videoToMp3;
