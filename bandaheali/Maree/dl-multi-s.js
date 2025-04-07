import axios from 'axios';
import config from '../../config.cjs';

// Store active sessions
const activeSessions = new Map();

// Cleanup old sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, session] of activeSessions.entries()) {
    if (now - session.timestamp > 300000) { // 5 minutes
      activeSessions.delete(key);
    }
  }
}, 300000);

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
      const sessionId = `${m.from}_${Date.now()}`;

      // Store the session data
      activeSessions.set(sessionId, {
        title,
        download_url,
        thumbnail,
        duration,
        timestamp: Date.now(),
        originalMessage: m
      });

      // Send format choice request
      await sock.sendMessage(
        m.from,
        { 
          text: `🎵 *${title}* (${duration})\n\nReply with:\n1. For Video\n2. For Audio\n\nOr type "video" or "audio"`,
        },
        { quoted: m }
      );

      // Create reply handler
      const replyHandler = async (msg) => {
        if (msg.key.remoteJid === m.from && 
            !msg.key.fromMe && 
            (msg.message?.conversation || msg.message?.extendedTextMessage?.text)) {
          
          const userReply = (msg.message.conversation || msg.message.extendedTextMessage.text).toLowerCase().trim();
          const session = activeSessions.get(sessionId);

          if (session && (userReply === '1' || userReply === '2' || 
              userReply === 'video' || userReply === 'audio')) {
            
            // Remove the session
            activeSessions.delete(sessionId);
            
            try {
              if (userReply === '1' || userReply === 'video') {
                await sock.sendMessage(
                  m.from,
                  {
                    video: { url: session.download_url },
                    mimetype: "video/mp4",
                    caption: `🎬 *${session.title}*\n⏱ ${session.duration}`,
                    thumbnail: session.thumbnail
                  },
                  { quoted: session.originalMessage }
                );
                await m.React('🎬');
              } 
              else if (userReply === '2' || userReply === 'audio') {
                await sock.sendMessage(
                  m.from,
                  {
                    audio: { url: session.download_url },
                    mimetype: "audio/mpeg",
                    caption: `🎵 *${session.title}*\n⏱ ${session.duration}`,
                    thumbnail: session.thumbnail
                  },
                  { quoted: session.originalMessage }
                );
                await m.React('🎵');
              }
            } catch (error) {
              console.error("Error sending media:", error);
              await sock.sendMessage(m.from, { text: "❌ Failed to send media!" }, { quoted: session.originalMessage });
              await m.React('❌');
            }
            
            // Remove this listener after handling
            sock.ev.off('messages.upsert', replyHandler);
          }
        }
      };

      // Add the reply handler
      sock.ev.on('messages.upsert', replyHandler);

      // Set timeout to remove listener if no response
      setTimeout(() => {
        if (activeSessions.has(sessionId)) {
          sock.ev.off('messages.upsert', replyHandler);
          activeSessions.delete(sessionId);
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
