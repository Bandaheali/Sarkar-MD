import yts from 'yt-search';
import config from '../../config.cjs';

const dlPlay = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "play") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or YouTube link!" }, { quoted: m });
    }

    await m.React('⏳'); // Loading...

    try {
      // Improved search with audio filter
      const searchResults = await yts(`${text} audio`);
      if (!searchResults.videos.length) {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const video = searchResults.videos[0];
      const videoUrl = encodeURIComponent(video.url);

      // Use a more reliable API endpoint
      const apiUrl = `https://api.sparky.biz.id/api/downloader/song?search=${videoUrl}&apikey=YOUR_API_KEY`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      if (!response.ok) {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "❌ Audio service unavailable. Try again later." }, { quoted: m });
      }

      const result = await response.json();

      if (!result.status || !result.data?.dl) {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "❌ Failed to process audio!" }, { quoted: m });
      }

      const { title, dl } = result.data;

      // Verify the audio URL before sending
      const audioCheck = await fetch(dl, { method: 'HEAD' });
      if (!audioCheck.ok) {
        await m.React('❌');
        return sock.sendMessage(m.from, { text: "❌ Invalid audio file!" }, { quoted: m });
      }

      await m.React('✅'); // Success

      // Send with additional options for better compatibility
      await sock.sendMessage(
        m.from,
        {
          audio: { url: dl },
          mimetype: 'audio/mp4', // Try mp4 if mpeg doesn't work
          ptt: false,
          fileName: `${title}.mp3`.replace(/[^\w.-]/g, '_'),
          caption: `🎵 *Title:* ${title}\n⏱ *Duration:* ${video.timestamp || 'N/A'}\n📥 *Powered by SPARKY API*`,
        },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in dlPlay command:", error);
      await m.React('❌');
      sock.sendMessage(m.from, { 
        text: "❌ Failed to process your request. Please try a different song or try again later." 
      }, { quoted: m });
    }
  }
};

export default dlPlay;
