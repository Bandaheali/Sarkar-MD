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
  
  const validCommands = ['tomp3', 'video2mp3', 'extractaudio'];
  if (!validCommands.includes(cmd)) return;

  try {
    // Check for media in different ways
    let media = m;
    let isQuoted = false;

    // Check if the message is a reply to another message
    if (m.hasQuotedMsg) {
      const quotedMsg = await m.getQuotedMessage();
      if (quotedMsg.hasMedia) {
        media = quotedMsg;
        isQuoted = true;
      }
    }

    // Check if the message itself has media
    if (!isQuoted && !m.hasMedia) {
      return m.reply('Please send or reply to a video message with this command.\nExample: reply to a video with *!tomp3*');
    }

    // Verify it's a video
    const mediaData = await media.downloadMedia();
    if (!mediaData.mimetype.includes('video')) {
      return m.reply('The file you sent/replied to is not a video. Please send/reply to a video file.');
    }

    // Create temp directory if not exists
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp');
    }

    const inputPath = `./temp/${media.id.id || media.id}.mp4`;
    const outputPath = `./temp/${media.id.id || media.id}.mp3`;

    await writeFileAsync(inputPath, mediaData.data, 'base64');

    // Convert to MP3
    const command = `ffmpeg -i ${inputPath} -q:a 0 -map a ${outputPath}`;
    
    await new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) {
          console.error('Conversion error:', error);
          reject(new Error('Conversion failed'));
          return;
        }
        resolve();
      });
    });

    // Send the converted audio
    const audioData = fs.readFileSync(outputPath);
    await gss.sendMessage(
      m.from,
      {
        audio: audioData,
        mimetype: 'audio/mpeg',
        ptt: false
      },
      { quoted: m }
    );

    // Cleanup
    await Promise.all([
      unlinkAsync(inputPath),
      unlinkAsync(outputPath)
    ]);

  } catch (error) {
    console.error('Error in videoToMp3:', error);
    m.reply('Error converting video to MP3. Please make sure:\n1. You sent/replied to a video\n2. FFmpeg is installed on server\n3. The video is not too long');
  }
};

export default videoToMp3;
