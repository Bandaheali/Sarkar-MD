import axios from 'axios';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const joke = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (cmd !== "joke") return;

    try {
        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Fetch joke from API
        const response = await axios.get('https://api.popcat.xyz/v2/joke');
        const jokeText = response.data.message.joke;

        // Send joke with newsletter styling
        await sendNewsletter(
            sock,
            m.from,
            `😂 *Joke of the Day* 😂\n\n${jokeText}\n\n🤣 *Hope that made you smile!*`,
            m,
            "🎭 Random Joke",
            "KEEP USING SARKAR-MD",
            "https://i.imgur.com/8v7QW0a.png" // Funny thumbnail
        );

        await m.React('😂');

    } catch (error) {
        console.error("Joke Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Couldn't fetch a joke!*\n\n• Try again later",
            m,
            "🎭 Joke Failed",
            "Better luck next time"
        );
        await m.React('❌');
    }
};

export default joke;
