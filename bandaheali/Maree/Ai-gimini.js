import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';
import fetch from 'node-fetch';

const gemini = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "gemini") return;

    try {
        if (!query) {
            await sendNewsletter(
                sock,
                m.from,
                "❌ *Please enter your question!*\n\nExample: `.gemini explain machine learning`",
                m,
                "🔮 Gemini AI",
                "Query Required"
            );
            return;
        }

        // Show processing indicators
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // API call
        const apiUrl = `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.data) {
            throw new Error("Invalid API response");
        }

        // Format response
        let aiResponse = data.data;
        const chunks = [];
        while (aiResponse.length > 0) {
            chunks.push(aiResponse.substring(0, 3000));
            aiResponse = aiResponse.substring(3000);
        }

        // Send first chunk with newsletter style
        await sendNewsletter(
            sock,
            m.from,
            `*🔮 Gemini Response:*\n\n${chunks[0]}`,
            m,
            "🤖 Google Gemini",
            `Part 1/${chunks.length}`
        );

        // Send remaining chunks
        for (let i = 1; i < chunks.length; i++) {
            await sock.sendMessage(
                m.from,
                { text: `*[Continued]*\n\n${chunks[i]}` },
                { quoted: m }
            );
        }

        await m.React('✅');

    } catch (error) {
        console.error(error);
        await sendNewsletter(
            sock,
            m.from,
            "⚠️ *Gemini Service Error!*\n\nPlease try again later.",
            m,
            "🔮 Gemini AI",
            "API Failure"
        );
        await m.React('❌');
    }
};

export default gemini;
