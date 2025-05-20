import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';
import fetch from 'node-fetch';

const pair = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() 
        : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "pair") return;

    try {
        // Error handling for empty input
        if (!text) {
            await sendNewsletter(
                sock,
                m.from,
                "❌ *Invalid Format!*\n\n✅ *Example:* `.pair 923477868XXX`",
                m,
                "✨ Pairing Code ✨",
                "Format Error"
            );
            return;
        }

        // API call
        const apiUrl = `https://sarkarmd-session-generator.onrender.com/code?number=${text}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.code) {
            await sendNewsletter(
                sock,
                m.from,
                "❌ Failed to generate pairing code!\n\nPlease check the number format.",
                m,
                "✨ Pairing Code ✨",
                "API Error"
            );
            return;
        }

        // React to show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // First send the code alone (easy to copy)
        await sock.sendMessage(
            m.from,
            { 
                text: `\`\`\`${data.code}\`\`\``,
                contextInfo: {
                    mentionedJid: [m.sender]
                }
            },
            { quoted: m }
        );

        // Then send newsletter-styled info
        await sendNewsletter(
            sock,
            m.from,
            `🔐 *Pairing Code Generated!*\n\n📱 *For Number:* ${text}\n✨ *Code sent above*`,
            m,
            "✨ Pairing Success ✨",
            "Copy the code from above message"
        );

        await m.React('✅');

    } catch (error) {
        console.error(error);
        await sendNewsletter(
            sock,
            m.from,
            "⚠️ Server Error!\n\nPlease try again later.",
            m,
            "✨ Pairing Code ✨",
            "System Error"
        );
        await m.React('❌');
    }
};

export default pair;
