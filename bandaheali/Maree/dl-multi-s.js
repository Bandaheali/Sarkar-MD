import axios from 'axios';
import config from '../../config.cjs';

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

    await m.React('⏳'); // Loading reaction

    try {
      // Fetch from API
      const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.status || !data.result) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const { title, video_url, thumbnail, duration, download_url } = data.result;

      // Ask user for format choice
      await sock.sendMessage(
        m.from,
        {
          text: `🎵 *${title}* (${duration})\n\nChoose format:\n1. Video\n2. Audio`,
          templateButtons: [
            { quickReplyButton: { displayText: "1. Video", id: "video_choice" } },
            { quickReplyButton: { displayText: "2. Audio", id: "audio_choice" } }
          ],
          thumbnail: thumbnail
        },
        { quoted: m }
      );

      // Handle user choice
      sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (msg.key.remoteJid === m.from && msg.key.fromMe === false) {
          const choice = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

          if (choice === '1' || choice.toLowerCase().includes('video')) {
            await m.React('🎬');
            sock.sendMessage(
              m.from,
              {
                video: { url: download_url },
                mimetype: "video/mp4",
                caption: `🎬 *${title}*\n⏱ ${duration}\n📥 Powered by David Cyril API`,
                thumbnail: thumbnail
              },
              { quoted: m }
            );
          } else if (choice === '2' || choice.toLowerCase().includes('audio')) {
            await m.React('🎵');
            sock.sendMessage(
              m.from,
              {
                audio: { url: download_url },
                mimetype: "audio/mpeg",
                fileName: `${title}.mp3`,
                caption: `🎵 *${title}*\n⏱ ${duration}\n📥 Powered by David Cyril API`,
                thumbnail: thumbnail
              },
              { quoted: m }
            );
          }
        }
      });

    } catch (error) {
      console.error("Error in play command:", error);
      sock.sendMessage(m.from, { text: "❌ An error occurred while processing your request!" }, { quoted: m });
      await m.React('❌');
    }
  }
};

export default playHandler;
