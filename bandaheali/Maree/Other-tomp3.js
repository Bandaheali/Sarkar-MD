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

    // Debugging: Log message structure
    console.log('Original message:', {
      body: m.body,
      hasMedia: m.hasMedia,
      hasQuotedMsg: m.hasQuotedMsg,
      type: m.type
    });

    // Check if the message is a reply to another message
    if (m.hasQuotedMsg) {
      const quotedMsg = await m.getQuotedMessage();
      console.log('Quoted message:', {
        body: quotedMsg.body,
        hasMedia: quotedMsg.hasMedia,
        type: quotedMsg.type
      });

      if (quotedMsg.hasMedia) {
        mediaMessage = quotedMsg;
        isQuoted = true;
        console.log('Using quoted media');
      }
    }

    // Final check for media
    if (!mediaMessage.hasMedia) {
      console.log('No media found');
      return m.reply('📛 Please *send a video* or *reply to a video* with this command.\nExample: Reply to a video with *!tomp3*');
    }

    // Download the media
    const mediaData = await mediaMessage.downloadMedia();
    console.log('Downloaded media:', {
      mimetype: mediaData.mimetype,
      size: mediaData.data.length
    });

    // Verify it's a video
    if (!mediaData.mimetype.includes('video')) {
      return m.reply('❌ Only video files can be converted to MP3!\nPlease send or reply to a *video file*');
    }

    // Create temp directory if not exists
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp');
    }

    const timestamp = Date.now();
    const inputPath = `./temp/input_${timestamp}.mp4`;
    const outputPath = `./temp/output_${timestamp}.mp3`;

    await writeFileAsync(inputPath, mediaData.data, 'base64');
    console.log('Video saved to:', inputPath);

    // Convert to MP3
    const command = `ffmpeg -i ${inputPath} -q:a 0 -map a ${outputPath}`;
    console.log('Executing:', command);
    
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg error:', error);
          console.error('FFmpeg stderr:', stderr);
          reject(new Error('Video conversion failed'));
          return;
        }
        console.log('Conversion successful');
        resolve();
      });
    });

    // Send the converted audio
    const audioData = fs.readFileSync(outputPath);
    console.log('Audio file size:', audioData.length);
    
    await gss.sendMessage(
      m.from,
      {
        audio: audioData,
        mimetype: 'audio/mpeg',
        ptt: false,
        caption: '🎧 Here\'s your audio file extracted from the video!'
      },
      { quoted: m }
    );

    // Cleanup
    await Promise.all([
      unlinkAsync(inputPath),
      unlinkAsync(outputPath)
    ]);
    console.log('Temporary files cleaned up');

  } catch (error) {
    console.error('Error in videoToMp3:', error);
    
    let errorMsg = '⚠️ Error converting video to MP3!\n';
    if (error.message.includes('Video conversion failed')) {
      errorMsg += 'The video might be corrupted or too long.\nTry with a shorter video (under 1 minute).';
    } else {
      errorMsg += 'Please make sure:\n1. FFmpeg is installed\n2. Video is not corrupted\n3. Try again later';
    }
    
    m.reply(errorMsg);
  }
};

export default videoToMp3;
