import fetch from 'node-fetch';
import config from '../../config.js';

const downloadTikTokVideo = async (m, gss) => {

  const prefix = config.PREFIX; 
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const args = m.body.slice(prefix.length + cmd.length).trim().split(' ');

  const url = args[0];

  const caption = args.slice(1).join(' ') || '*_Downloaded by SARKAR-MD_*'; // Default caption if none provided

  // Allowed TikTok download commands
  const validCommands = ['tiktokdl4', 'tt4', 'tiktok4'];

  if (validCommands.includes(cmd)) {

    if (!url) {
      return m.reply('Please provide a TikTok video URL.');
    }

    // API endpoint to fetch video
    const apiUrl = `https://bk9.fun/download/tiktok?url=${encodeURIComponent(url)}`;

    try {

      // Fetch request to the TikTok downloader API
      const response = await fetch(apiUrl);

      // Check if the response is not okay (any status other than 200)
      if (!response.ok) {
        const errorText = await response.text(); // Get the error text from the response
        console.error(`API Error: Status Code ${response.status}, Response Text: ${errorText}`);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      // Extract the HD video URL from the response
      const videoUrl = data?.BK9?.BK9 || null;

      if (!videoUrl) throw new Error('Video URL not found in API response.');

      // Send the HD video with caption
      await gss.sendMessage(m.from, { video: { url: videoUrl }, caption });

      // Optionally, delete the original command message after sending the video (for Baileys)
      await gss.sendMessage(m.key.remoteJid, { delete: m.key });

    } catch (error) {

      console.error('Error downloading TikTok video:', error.message);
      m.reply(`Failed to download TikTok video. Error: ${error.message}. Please try again later.`);

    }

  }

};

export default downloadTikTokVideo;
