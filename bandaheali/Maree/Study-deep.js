import axios from 'axios';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const deep = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (!['deepseek', 'deeps'].includes(cmd)) return;

    try {
        if (!query) {
            await sendNewsletter(
                sock,
                m.from,
                "📚 *Study Assistant Help*\n\nAsk academic questions like:\n• `.deep explain quantum physics`\n• `.deep math problem solving`\n• `.deep chemistry equations`",
                m,
                "🤖 DeepSeek AI",
                "Query Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // API request
        const apiUrl = `https://api.paxsenix.biz.id/ai/deepseek?text=${encodeURIComponent(query)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.ok || !data.message) {
            throw new Error("No response from AI");
        }

        // Format response
        const aiResponse = `🤖 *DeepSeek Response* 🤖\n\n${data.message}`;

        // Send as newsletter
        await sendNewsletter(
            sock,
            m.from,
            aiResponse,
            m,
            "🧠 AI Study Assistant",
            "KEEP USING SARKAR-MD",
            "https://i.imgur.com/Jm6h8ZO.png" // Brain thumbnail
        );

        await m.React('✅');

    } catch (error) {
        console.error("DeepSeek Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *AI Service Error*\n\n• API may be busy\n• Try simpler questions\n• Check back later",
            m,
            "🤖 DeepSeek AI",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default deep;
