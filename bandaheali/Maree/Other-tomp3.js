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
    let mediaMessage = m;
    let isQuoted = false;

    // Check if the message is a reply
    if (m.hasQuotedMsg) {
      const quotedMsg = await m.getQuotedMessage();
      if (quotedMsg && quotedMsg.hasMedia) {
        mediaMessage = quotedMsg;
        isQuoted = true;
      }
    }

    // Check if we have media (either direct or quoted)
    if (!mediaMessage.hasMedia) {
      return m.reply('🚫 Please send or reply to a video message with this command.\nExample: reply to a video with *!tomp3*');
    }

    // Download the media
    const mediaData = await mediaMessage.downloadMedia();
    
    // Verify it's a video
    if (!mediaData.mimetype.includes('video')) {
      return m.reply('❌ The file must be a video! Please send/reply to a video file.');
    }

    // Create temp directory if not exists
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp');
    }

    const timestamp = Date.now();
    const inputPath = `./temp/input_${timestamp}.mp4`;
    const outputPath = `./temp/output_${timestamp}.mp3`;

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
        ptt: false,
        caption: '✅ Here\'s your audio file extracted from the video!'
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
    let errorMsg = '❌ Error converting video to MP3. ';
    
    if (error.message.includes('Conversion failed')) {
      errorMsg += 'The video might be corrupted or in an unsupported format.';
    } else {
      errorMsg += 'Please make sure FFmpeg is installed on the server.';
    }
    
    m.reply(errorMsg);
  }
};

export default videoToMp3;
