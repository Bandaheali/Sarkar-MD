import config from '../../config';
import yts from 'yt-search';

const dlPlay = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "play") {
    if (!text) {
      await sock.sendMessage(m.from, { 
        text: "🔎 Please provide a song name or YouTube link!\nExample: *dlplay baby shark*" 
      }, { quoted: m });
      return;
    }

    try {
      await m.React('⏳');

      // Validate if it's a URL
      const isUrl = text.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i);
      
      const searchResults = await yts(isUrl ? text : `${text} audio`);
      if (!searchResults.videos.length) {
        await m.React('❌');
        return sock.sendMessage(m.from, { 
          text: "❌ No results found! Try a different search term." 
        }, { quoted: m });
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;

      // Show searching message
      await sock.sendMessage(m.from, {
        text: `🔍 Searching: *${video.title}*\n⏳ Downloading audio...`
      }, { quoted: m });

      const apiUrl = `https://api.sparky.biz.id/api/downloader/song?search=${encodeURIComponent(videoUrl)}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) throw new Error('API request failed');
      
      const result = await response.json();

      if (!result.status || !result.data?.dl) {
        await m.React('❌');
        return sock.sendMessage(m.from, { 
          text: "❌ Failed to fetch audio. The service might be temporarily unavailable." 
        }, { quoted: m });
      }

      const { title, dl } = result.data;
      const artist = video.author?.name || 'Unknown Artist';

      await m.React('✅');

      // Send audio with metadata
      await sock.sendMessage(
        m.from,
        {
          audio: { url: dl },
          mimetype: 'audio/mpeg',
          ptt: false,
          fileName: `${title}.mp3`.replace(/[^\w.-]/g, '_'), // Sanitize filename
          caption: `🎵 *Title:* ${title}\n🎤 *Artist:* ${artist}\n📥 *Powered by SPARKY API*`,
        },
        { quoted: m }
      );

    } catch (error) {
      console.error("Error in dlPlay command:", error);
      await m.React('❌');
      await sock.sendMessage(m.from, { 
        text: "❌ An error occurred. Please try again later or try a different song." 
      }, { quoted: m });
    }
  }
};
