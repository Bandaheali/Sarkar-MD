import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const support = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (cmd !== "support") return;

    try {
        const supportMessage = `
╔══════════════════════╗
       *🛠️ SARKAR-MD SUPPORT*       
╚══════════════════════╝

*📢 Official WhatsApp Channel:*
https://whatsapp.com/channel/0029VajGHyh2phHOH5zJl73P

*👥 Official Support Group:*
https://chat.whatsapp.com/YourGroupLink

*💻 GitHub Repository:*
https://github.com/Sarkar-Bandaheali/Sarkar-MD
━━━━━━━━━━━━━━━━━━━━━━
*❗ Important Requirements:*
- Must *fork* the GitHub repository
- Must *star* the project if you use it
━━━━━━━━━━━━━━━━━━━━━━
*💬 Words of Motivation:*
"${getRandomQuote()}"
`;

        await sendNewsletter(
            sock,
            m.from,
            supportMessage,
            m,
            "🌟 PROJECT SUPPORT",
            "Your support means everything",
            "https://i.imgur.com/NkUITKj.mp4" // Your thumbnail
        );

    } catch (error) {
        console.error(error);
        await sock.sendMessage(
            m.from,
            { text: "⚠️ Error loading support details" },
            { quoted: m }
        );
    }
};

function getRandomQuote() {
    const quotes = [
        "Great things in business are never done by one person",
        "The way to get started is to quit talking and begin doing",
        "Your time is limited, don't waste it living someone else's life",
        "Innovation distinguishes between a leader and a follower",
        "The only limit to our realization of tomorrow is our doubts of today",
        "The best way to predict the future is to create it",
        "Don't watch the clock; do what it does. Keep going",
        "Believe you can and you're halfway there",
        "The secret of getting ahead is getting started",
        "It always seems impossible until it's done",
        "Success is not final, failure is not fatal",
        "The only place where success comes before work is in the dictionary",
        "The future belongs to those who believe in the beauty of their dreams",
        "The harder I work, the luckier I get",
        "Dream big and dare to fail",
        "Quality is not an act, it is a habit",
        "Strive not to be a success, but rather to be of value",
        "The mind is everything. What you think you become",
        "Life is what happens when you're busy making other plans",
        "Do what you love and the money will follow"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

export default support;
