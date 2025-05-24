import axios from 'axios';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const element = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const elementName = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "element") return;

    try {
        if (!elementName) {
            await sendNewsletter(
                sock,
                m.from,
                "⚠️ *Please specify an element*\nExample: `.element iron` or `.element Fe`",
                m,
                "⚛️ Periodic Table",
                "Element Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Fetch element data
        const apiUrl = `https://api.popcat.xyz/periodic-table?element=${encodeURIComponent(elementName)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.name) {
            throw new Error("Element not found");
        }

        // Format element info with HTML-like formatting
        const elementInfo = `
✨ *${data.name} (${data.symbol})* ✨

▫️ *Atomic Number:* ${data.atomic_number}
▫️ *Atomic Mass:* ${data.atomic_mass}
▫️ *Period:* ${data.period} | *Phase:* ${data.phase}
▫️ *Discovered:* ${data.discovered_by}

📜 *Description:*
${data.summary}
`;

        // Send as newsletter with image
        await sendNewsletter(
            sock,
            m.from,
            elementInfo,
            m,
            `⚛️ ${data.name} (${data.symbol})`,
            `Period ${data.period} | Atomic Mass: ${data.atomic_mass}`,
            data.image // Element image as thumbnail
        );

        await m.React('✅');

    } catch (error) {
        console.error("Element Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Element Not Found*\n\n• Check spelling (e.g. 'iron' or 'Fe')\n• Try English element names\n• Supported: 1-118 elements",
            m,
            "⚛️ Periodic Table",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default element;
