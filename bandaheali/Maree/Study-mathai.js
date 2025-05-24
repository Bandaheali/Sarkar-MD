import axios from 'axios';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const mathai = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "mathai") return;

    try {
        if (!query) {
            await sendNewsletter(
                sock,
                m.from,
                "🧮 *Math AI Help*\n\nAsk math questions like:\n• `.mathai 2x + 5 = 15`\n• `.mathai ∫(x^2)dx`\n• `.mathai 2^10`",
                m,
                "➗ Math Specialist",
                "Query Required"
            );
            return;
        }

        // Check if question is math-related
        const mathKeywords = ['solve', 'calculate', 'equation', 'formula', 'algebra', 
                             'geometry', 'calculus', 'trigonometry', 'derivative',
                             'integral', 'matrix', 'probability', 'statistics'];
        
        const isMathQuery = mathKeywords.some(keyword => 
            query.toLowerCase().includes(keyword)) || 
            /[\d+\-*/^=√π]/.test(query);

        if (!isMathQuery) {
            await sendNewsletter(
                sock,
                m.from,
                "❌ *I'm a Math Specialist*\n\nSorry, I can only help with:\n• Algebra\n• Calculus\n• Equations\n• Formulas\n\nAsk me math questions only!",
                m,
                "➗ Math AI",
                "Created by Bandaheali"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // API request with math-specific prompt
        const prompt = `You are a mathematics AI assistant. Only answer math-related questions. 
        Question: ${query}. Provide step-by-step solution.`;
        
        const apiUrl = `https://api.paxsenix.biz.id/ai/gemini-realtime?text=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.ok || !data.message) {
            throw new Error("Math solving failed");
        }

        // Format response
        const mathResponse = `🧮 *Math Solution* 🧮\n\n*Question:* ${query}\n\n${data.message}\n\n📝 *Steps provided by Math AI*`;

        // Send as newsletter
        await sendNewsletter(
            sock,
            m.from,
            mathResponse,
            m,
            "➗ Math Solved",
            "Step-by-step solution",
            "https://i.imgur.com/4QmZr0A.png" // Math thumbnail
        );

        await m.React('✅');

    } catch (error) {
        console.error("MathAI Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Math Solving Failed*\n\n• Try rephrasing your question\n• Check math symbols\n• Server may be busy",
            m,
            "➗ Math AI",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default mathai;
