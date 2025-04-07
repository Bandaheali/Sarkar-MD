import axios from 'axios';
import config from '../../config.cjs';

// Store pending requests with automatic cleanup
const pendingRequests = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pendingRequests.entries()) {
    if (now - value.timestamp > 300000) { // Cleanup after 5 minutes
      pendingRequests.delete(key);
    }
  }
}, 60000); // Run cleanup every minute

const playHandler = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "mix") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "🔎 Please provide a song name or artist!" }, { quoted: m });
    }

    await m.React('⏳');

    try {
      const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.status || !data.result) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const { title, download_url, thumbnail, duration } = data.result;
      const requestKey = `${Date.now()}_${m.from}`;

      // Store the request data
      pendingRequests.set(requestKey, {
        title,
        download_url,
        thumbnail,
        duration,
        timestamp: Date.now()
      });

      // Create a temporary message listener just for this interaction
      const listener = async (msg) => {
        if (msg.key.remoteJid === m.from && 
            msg.key.fromMe === false && 
            (msg.message?.conversation || msg.message?.extendedTextMessage?.text)) {
          
          const choice = msg.message.conversation || msg.message.extendedTextMessage.text;
          const requestData = pendingRequests.get(requestKey);

          if (requestData && (choice === '1' || choice === '2' || 
              choice.toLowerCase().includes('video') || 
              choice.toLowerCase().includes('audio'))) {
            
            // Remove the listener after handling
            sock.ev.off('messages.upsert', listener);
            pendingRequests.delete(requestKey);

            try {
              if (choice === '1' || choice.toLowerCase().includes('video')) {
                await m.React('🎬');
                await sock.sendMessage(
                  m.from,
                  {
                    video: { url: requestData.download_url },
                    mimetype: "video/mp4",
                    caption: `🎬 *${requestData.title}*\n⏱ ${requestData.duration}`,
                    thumbnail: requestData.thumbnail
                  },
                  { quoted: m }
                );
              } 
              else if (choice === '2' || choice.toLowerCase().includes('audio')) {
                await m.React('🎵');
                await sock.sendMessage(
                  m.from,
                  {
                    audio: { url: requestData.download_url },
                    mimetype: "audio/mpeg",
                    caption: `🎵 *${requestData.title}*\n⏱ ${requestData.duration}`,
                    thumbnail: requestData.thumbnail
                  },
                  { quoted: m }
                );
              }
            } catch (error) {
              console.error("Error sending media:", error);
              await sock.sendMessage(m.from, { text: "❌ Failed to send media!" }, { quoted: m });
              await m.React('❌');
            }
          }
        }
      };

      // Add the temporary listener
      sock.ev.on('messages.upsert', listener);

      // Ask for format choice
      await sock.sendMessage(
        m.from,
        { 
          text: `🎵 *${title}* (${duration})\n\nReply with:\n1. For Video\n2. For Audio\n\nOr type "video" or "audio"`,
        },
        { quoted: m }
      );

      // Set timeout to clean up listener if no response
      setTimeout(() => {
        if (pendingRequests.has(requestKey)) {
          sock.ev.off('messages.upsert', listener);
          pendingRequests.delete(requestKey);
        }
      }, 180000); // 3 minute timeout

    } catch (error) {
      console.error("Error in play command:", error);
      await sock.sendMessage(m.from, { text: "❌ Failed to process your request!" }, { quoted: m });
      await m.React('❌');
    }
  }
};

export default playHandler;
