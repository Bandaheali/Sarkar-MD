import axios from 'axios';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const ss = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const url = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "ss") return;

    try {
        if (!url) {
            await sendNewsletter(
                sock,
                m.from,
                "⚠️ *Please provide a website URL*\nExample: `.ss https://google.com`",
                m,
                "🌐 Website Screenshot",
                "URL Required"
            );
            return;
        }

        // Validate URL format
        if (!url.match(/^https?:\/\//i)) {
            throw new Error("Invalid URL - must start with http:// or https://");
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // API request with timeout
        const apiUrl = `https://api.popcat.xyz/v2/screenshot?url=${encodeURIComponent(url)}`;
        const screenshotUrl = `${apiUrl}&timestamp=${Date.now()}`; // Cache busting

        // Send screenshot with newsletter styling
        await sock.sendMessage(
            m.from,
            {
                image: { url: screenshotUrl },
                caption: `🌐 *Website Screenshot* ✅\n\n🔗 *URL:* ${url}`,
                contextInfo: {
                    externalAdReply: {
                        title: "✨ Sarkar-MD ✨",
                        body: "Website Screenshot Service",
                        thumbnailUrl: screenshotUrl,
                        sourceUrl: url,
                        mediaType: 1
                    }
                }
            },
            { quoted: m }
        );

        await m.React('✅');

    } catch (error) {
        console.error("Screenshot Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            `❌ *Screenshot Failed*\n\n${getErrorMessage(error)}`,
            m,
            "🌐 Website Screenshot",
            "Try Again"
        );
        await m.React('❌');
    }
};

function getErrorMessage(error) {
    if (error.message.includes("Invalid URL")) {
        return "• Must include http:// or https://\n• Example: https://google.com";
    } else if (error.message.includes("timeout")) {
        return "• Website took too long to load\n• Try simpler websites";
    } else {
        return "• Invalid website\n• Site may block screenshots\n• Check URL and try again";
    }
}

export default ss;
