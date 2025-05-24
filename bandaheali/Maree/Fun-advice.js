import axios from 'axios';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const advice = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (cmd !== "advice") return;

    try {
        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Fetch advice from API
        const response = await axios.get('https://api.adviceslip.com/advice');
        const adviceText = response.data.slip.advice;

        // Send advice with newsletter styling
        await sendNewsletter(
            sock,
            m.from,
            `💡 *Random Advice* 💡\n\n"${adviceText}"\n\n✨ *Words of Wisdom* ✨`,
            m,
            "🧠 Life Advice",
            "Powered by Adviceslip API",
            "https://i.imgur.com/JQ0wX9p.png" // Lightbulb thumbnail
        );

        await m.React('💡');

    } catch (error) {
        console.error("Advice Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Couldn't fetch advice!*\n\n• API is busy\n• Try again later",
            m,
            "🧠 Life Advice",
            "Better luck next time"
        );
        await m.React('❌');
    }
};

export default advice;
