import axios from 'axios';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const yta = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "yta") return;

    try {
        if (!query) {
            await sendNewsletter(
                sock,
                m.from,
                "🎵 *YouTube Audio Downloader*\n\nUsage: `.yta [song/video title]`\nExample: `.yta Aku Ada Putri Dahlia`",
                m,
                "📻 YTA Command",
                "Query Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Fetch audio from API
        const apiUrl = `https://api.agatz.xyz/api/ytplay?message=${encodeURIComponent(query)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.data?.audio?.url) {
            throw new Error("No audio found");
        }

        const audioInfo = data.data.info;
        const audioFile = data.data.audio;

        // Format info message
        const infoMessage = `
🎧 *${audioInfo.title}*

👤 Artist: ${audioInfo.author.name}
⏱ Duration: ${audioInfo.duration}
📊 Views: ${audioInfo.views}
📅 Uploaded: ${audioInfo.uploaded}

🔊 Quality: ${audioFile.quality}
`;

        // Send audio file with metadata
        await sock.sendMessage(
            m.from,
            {
                audio: { url: audioFile.url },
                mimetype: 'audio/mpeg',
                contextInfo: {
                    externalAdReply: {
                        title: audioInfo.title.slice(0, 30),
                        body: `By ${audioInfo.author.name}`,
                        thumbnailUrl: audioInfo.thumbnail,
                        sourceUrl: audioInfo.url,
                        mediaType: 2
                    }
                }
            },
            { quoted: m }
        );

        // Send video info separately
        await sendNewsletter(
            sock,
            m.from,
            infoMessage,
            m,
            "🎵 Downloaded Audio",
            "Enjoy your music!"
        );

        await m.React('✅');

    } catch (error) {
        console.error("YTA Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Download Failed*\n\n• Video not found\n• Try different keywords\n• May be age-restricted",
            m,
            "📻 YTA Error",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default yta;
