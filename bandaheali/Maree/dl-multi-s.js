import axios from 'axios';
import config from '../../config.cjs';

// Store active choices to handle responses
const activeChoices = new Map();

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
      const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.status || !data.result) {
        return sock.sendMessage(m.from, { text: "❌ No results found!" }, { quoted: m });
      }

      const { title, video_url, thumbnail, duration, download_url } = data.result;
      const messageId = m.key.id; // Store original message ID

      // Store the download info with the message ID
      activeChoices.set(messageId, {
        title,
        download_url,
        thumbnail,
        duration
      });

      // Ask user for format choice
      await sock.sendMessage(
        m.from,
        {
          text: `🎵 *${title}* (${duration})\n\nChoose format:\n1. Video\n2. Audio`,
          buttons: [
            { buttonId: 'video_choice', buttonText: { displayText: '1. Video' }, type: 1 },
            { buttonId: 'audio_choice', buttonText: { displayText: '2. Audio' }, type: 1 }
          ],
          footer: 'Select your preferred format',
          headerType: 1
        },
        { quoted: m }
      );

    } catch (error) {
      console.error("Error in play command:", error);
      sock.sendMessage(m.from, { text: "❌ An error occurred while processing your request!" }, { quoted: m });
      await m.React('❌');
    }
  }
};

// Handle button responses separately
const handleResponse = async (m, sock) => {
  if (!m.message?.buttonsResponseMessage) return;
  
  const messageId = m.message.buttonsResponseMessage.contextInfo?.stanzaId;
  const buttonId = m.message.buttonsResponseMessage.selectedButtonId;
  
  if (!activeChoices.has(messageId)) return;
  
  const { title, download_url, thumbnail, duration } = activeChoices.get(messageId);
  
  try {
    if (buttonId === 'video_choice') {
      await sock.sendMessage(
        m.from,
        {
          video: { url: download_url },
          mimetype: "video/mp4",
          caption: `🎬 *${title}*\n⏱ ${duration}\n📥 Powered by David Cyril API`,
          thumbnail: thumbnail
        },
        { quoted: m }
      );
    } else if (buttonId === 'audio_choice') {
      await sock.sendMessage(
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
    
    // Clean up
    activeChoices.delete(messageId);
  } catch (error) {
    console.error("Error handling response:", error);
  }
};

// Add this listener once when initializing your bot
// sock.ev.on('messages.upsert', ({ messages }) => handleResponse(messages[0], sock));

export default playHandler;
