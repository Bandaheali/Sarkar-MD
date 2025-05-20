import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const jid = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    // Command check
    if (cmd !== 'jid') return;

    try {
        // Send only the JID (works for both private and group chats)
        await sendNewsletter(
            sock,
            m.from,
            `${m.from}`,
            m,
            "✨ JID Finder ✨",
            "JID Information"
        );

    } catch (error) {
        await sendNewsletter(
            sock,
            m.from,
            "❌ Error: " + error.message,
            m,
            "✨ JID Finder ✨",
            "Error"
        );
        console.error("JID Command Error:", error);
    }
};

export default jid;
