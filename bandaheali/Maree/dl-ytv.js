import axios from 'axios';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const ytv = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "ytv") return;

    try {
        if (!query) {
            await sendNewsletter(
                sock,
                m.from,
                "🎬 *YouTube Video Downloader*\n\nUsage: `.ytv [video title]`\nExample: `.ytv Angkasa Diandra`",
                m,
                "📹 YTV Command",
                "Query Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Fetch video from API
        const apiUrl = `https://api.agatz.xyz/api/ytplayvid?message=${encodeURIComponent(query)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.data?.downloadLinks?.video?.[0]?.url) {
            throw new Error("No video found");
        }

        const videoInfo = data.data;
        const videoFile = videoInfo.downloadLinks.video[0];

        // Format info message
        const infoMessage = `
🎥 *${videoInfo.title}*

👤 Channel: ${videoInfo.author}
⏱ Uploaded: ${videoInfo.uploadedAt}
📊 Views: ${videoInfo.views}
📺 Quality: ${videoFile.quality}
`;

        // Send video file with metadata
        await sock.sendMessage(
            m.from,
            {
                video: { url: videoFile.url },
                caption: infoMessage,
                contextInfo: {
                    externalAdReply: {
                        title: videoInfo.title.slice(0, 30),
                        body: `By ${videoInfo.author}`,
                        thumbnailUrl: videoInfo.thumbnailUrl,
                        sourceUrl: `https://youtube.com/watch?v=${videoFile.url.split('/').pop()}`,
                        mediaType: 2
                    }
                }
            },
            { quoted: m }
        );

        await m.React('✅');

    } catch (error) {
        console.error("YTV Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Download Failed*\n\n• Video not found\n• Try different keywords\n• May be restricted",
            m,
            "📹 YTV Error",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default ytv;
