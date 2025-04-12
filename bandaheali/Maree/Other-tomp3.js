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
    let videoMessage = null;

    // Case 1: Direct video message
    if (m.mtype === 'videoMessage') {
      videoMessage = m;
    }
    // Case 2: Quoted video message
    else if (m.quoted && m.quoted.mtype === 'videoMessage') {
      videoMessage = await m.getQuotedMessage();
    }
    // Case 3: Message with video attachment
    else if (m.hasMedia) {
      const mediaData = await m.downloadMedia();
      if (mediaData.mimetype.includes('video')) {
        videoMessage = m;
      }
    }

    // If no video found
    if (!videoMessage) {
      return m.reply(`📛 Please send or reply to a video with command ${prefix + cmd}\nExample:\n${prefix}tomp3 (with video attached)\nor\nReply ${prefix}tomp3 to a video message`);
    }

    // Download the video
    const videoData = await videoMessage.downloadMedia();
    if (!videoData.mimetype.includes('video')) {
      return m.reply('❌ The file must be a video!');
    }

    // Create temp directory
    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
    const timestamp = Date.now();
    const inputPath = `./temp/video_${timestamp}.mp4`;
    const outputPath = `./temp/audio_${timestamp}.mp3`;

    await writeFileAsync(inputPath, videoData.data, 'base64');

    // Convert to MP3
    const command = `ffmpeg -i ${inputPath} -vn -acodec libmp3lame -ac 2 -ab 160k -ar 48000 ${outputPath}`;
    
    await new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) reject(new Error('FFmpeg conversion failed'));
        else resolve();
      });
    });

    // Send the MP3
    const audioBuffer = fs.readFileSync(outputPath);
    await gss.sendMessage(
      m.from,
      {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        caption: '✅ Conversion successful!'
      },
      { quoted: m }
    );

    // Cleanup
    await Promise.all([
      unlinkAsync(inputPath),
      unlinkAsync(outputPath)
    ]);

  } catch (error) {
    console.error('Conversion error:', error);
    m.reply('❌ Conversion failed! ' + 
      (error.message.includes('FFmpeg') ? 
      'Make sure FFmpeg is installed' : 
      'Try with a different video'));
  }
};

export default videoToMp3;
