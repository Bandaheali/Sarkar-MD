import yts from 'yt-search';
import config from '../../config.cjs';
import axios from 'axios';
import { pipeline } from 'stream';
import { promisify } from 'util';
import fs from 'fs';
import { exec } from 'child_process';

const streamPipeline = promisify(pipeline);

const dlVideo = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "video" || cmd === "vid") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
    }

    await m.React('⏳'); // React with a loading icon

    try {
      // Search for the video using yt-search
      const searchResults = await yts(text);
      if (!searchResults.videos.length) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const video = searchResults.videos[0]; // Get the first result
      const videoUrl = video.url;

      // Fetch video download link from API
      const apiUrl = `https://bandahealimaree-api-ytdl.hf.space/api/ytmp4?url=${videoUrl}`;
      const response = await axios.get(apiUrl);
      const result = response.data;

      if (!result.status || !result.download || !result.download.downloadUrl) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch download link!" }, { quoted: m });
      }

      const { title, downloadUrl } = result.download;

      // Check file size before downloading
      const fileSize = await getFileSize(downloadUrl);
      const maxFileSize = 100 * 1024 * 1024; // 100MB limit

      if (fileSize > maxFileSize) {
        return sock.sendMessage(m.from, { text: `❌ File is too large (${(fileSize / (1024 * 1024)).toFixed(2)}MB). Max allowed size is 100MB.` }, { quoted: m });
      }

      // Download the file to a temporary location
      const tempFilePath = `./temp_${Date.now()}.mp4`;
      const writer = fs.createWriteStream(tempFilePath);

      await m.React('⬇️'); // React with a download icon

      // Stream the video file
      const responseStream = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream',
      });

      await streamPipeline(responseStream.data, writer);

      await m.React('✅'); // React with a success icon

      // Send the video file
      sock.sendMessage(
        m.from,
        {
          video: fs.readFileSync(tempFilePath),
          mimetype: "video/mp4",
          caption: `🎵 *Title:* ${title}\n📥 *Downloaded from:* Sarkar-MD\n\nPOWERED BY BANDAHEALI`,
        },
        { quoted: m }
      );

      // Delete the temporary file
      fs.unlinkSync(tempFilePath);
    } catch (error) {
      console.error("Error in video command:", error);
      sock.sendMessage(m.from, { text: "❌ An error occurred while processing your request!" }, { quoted: m });
    }
  }
};

// Function to get file size from URL
const getFileSize = async (url) => {
  return new Promise((resolve, reject) => {
    axios.head(url)
      .then(response => {
        const contentLength = response.headers['content-length'];
        resolve(parseInt(contentLength, 10));
      })
      .catch(error => {
        reject(error);
      });
  });
};

export default dlVideo;