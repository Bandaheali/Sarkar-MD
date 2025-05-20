import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const jid = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    // Command check
    if (cmd !== 'jid') return;

    // Proper group detection
    const isGroup = m.key.remoteJid.endsWith('@g.us');

    try {
        if (!isGroup) {
            // Personal chat
            await sendNewsletter(
                sock,
                m.from,
                `📌 *Your Personal JID:*\n\`\`\`${m.from}\`\`\`\n📌 *Bot Prefix:* \`${prefix}\``,
                m,
                "✨ JID Finder ✨",
                "User Information"
            );
            return;
        }

        // Group info
        const groupInfo = await sock.groupMetadata(m.from);
        const participants = groupInfo.participants.map(p => p.id);

        let jidInfo = `
📌 *Group JID:* \`\`\`${m.from}\`\`\`
👤 *Creator:* \`\`\`${groupInfo.owner}\`\`\`
👥 *Participants (${participants.length}):*\n${
    participants.slice(0, 10).map((jid, i) => `${i+1}. \`\`\`${jid}\`\`\``).join('\n')
}${participants.length > 10 ? `\n...and ${participants.length-10} more` : ''}
        `;

        await sendNewsletter(
            sock,
            m.from,
            jidInfo,
            m,
            "✨ JID Finder ✨",
            "Group Information"
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
