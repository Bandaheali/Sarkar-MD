import axios from 'axios';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const sticker = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "ssticker") return;

    try {
        if (!query) {
            await sendNewsletter(
                sock,
                m.from,
                "🎭 *Sticker Search*\n\nUsage: `.sticker [sticker name]`\nExample: `.sticker mario`\n\nSearch for sticker packs by name",
                m,
                "🖼 Sticker Command",
                "Query Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Fetch sticker pack from API
        const apiUrl = `https://api.agatz.xyz/api/sticker?message=${encodeURIComponent(query)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.data?.sticker_url || data.data.sticker_url.length === 0) {
            throw new Error("No stickers found");
        }

        const stickerInfo = data.data;
        const stickerUrls = stickerInfo.sticker_url;

        // Format info message
        const infoMessage = `
🖼 *${stickerInfo.title} Sticker Pack*

📌 Contains ${stickerUrls.length} stickers
🔍 Search term: ${query}
`;

        // Send first 5 stickers as preview (WhatsApp has limits)
        const stickersToSend = stickerUrls.slice(0, 5);
        
        for (const url of stickersToSend) {
            await sock.sendMessage(
                m.from,
                {
                    sticker: { url },
                    contextInfo: {
                        externalAdReply: {
                            title: stickerInfo.title,
                            body: `Contains ${stickerUrls.length} stickers`,
                            thumbnailUrl: url,
                            sourceUrl: url,
                            mediaType: 1
                        }
                    }
                },
                { quoted: m }
            );
            // Add small delay between sends
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Send info message after stickers
        await sock.sendMessage(
            m.from,
            { text: infoMessage },
            { quoted: m }
        );

        await m.React('✅');

    } catch (error) {
        console.error("Sticker Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Sticker Search Failed*\n\n• No stickers found\n• Try different keywords\n• API may be down",
            m,
            "🖼 Sticker Error",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default sticker;
