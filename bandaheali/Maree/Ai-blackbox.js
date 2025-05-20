import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';
import fetch from 'node-fetch';

const blackbox = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (!["blackbox", "code"].includes(cmd)) return;

    try {
        if (!query) {
            await sendNewsletter(
                sock,
                m.from,
                "❌ *Please enter your coding question!*\n\nExample: `.blackbox fix this Python code`\nExample: `.code explain JavaScript closures`",
                m,
                "⌨️ BlackBox AI",
                "Query Required"
            );
            return;
        }

        // Show processing indicators
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // API call
        const apiUrl = `https://api.siputzx.my.id/api/ai/blackboxai-pro?content=${encodeURIComponent(query)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.data) {
            throw new Error("Invalid API response");
        }

        // Format code blocks if detected
        let aiResponse = data.data;
        const codeBlocks = aiResponse.match(/```[\s\S]*?```/g);
        
        if (codeBlocks) {
            codeBlocks.forEach((block, index) => {
                aiResponse = aiResponse.replace(block, `\`\`\`${block.split('\n').slice(1, -1).join('\n')}\`\`\``);
            });
        }

        // Split long messages
        const chunks = [];
        while (aiResponse.length > 0) {
            chunks.push(aiResponse.substring(0, 3000));
            aiResponse = aiResponse.substring(3000);
        }

        // Send first chunk with newsletter style
        await sendNewsletter(
            sock,
            m.from,
            `*⌨️ BlackBox Response:*\n\n${chunks[0]}`,
            m,
            "🤖 AI Coding Assistant",
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
            "⚠️ *Service Error!*\n\nPlease try again later.",
            m,
            "⌨️ BlackBox AI",
            "API Failure"
        );
        await m.React('❌');
    }
};

export default blackbox;
