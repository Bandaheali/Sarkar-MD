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
🌟 *SUPPORT INFORMATION* 🌟

📌 *Before asking for help:*
1. Try restarting your device
2. Make sure you're using the latest version

🔗 *Official Channels:*
📢 WhatsApp Channel: https://whatsapp.com/channel/0029VajGHyh2phHOH5zJl73P
👥 Support Group: https://chat.whatsapp.com/YourGroupLink
💻 GitHub Repo: https://github.com/Sarkar-Bandaheali/Sarkar-MD

📝 *Important Notice:*
- *Must* fork and star the repo if you use this bot!
- Your support keeps this project alive

💬 *Developer's Message:*
"${getRandomQuote()}"
`;

        await sendNewsletter(
            sock,
            m.from,
            supportMessage,
            m,
            "🛠️ Support Center",
            "We appreciate your support!",
            "https://i.imgur.com/NkUITKj.mp4" // Your thumbnail URL
        );

    } catch (error) {
        console.error(error);
        await sock.sendMessage(
            m.from,
            { text: "⚠️ Failed to load support information" },
            { quoted: m }
        );
    }
};

function getRandomQuote() {
    const quotes = [
        "Code is poetry - make yours beautiful",
        "Every star on GitHub lights up my motivation",
        "Support open source - it's the future",
        "Your appreciation fuels my coding nights"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

export default support;
