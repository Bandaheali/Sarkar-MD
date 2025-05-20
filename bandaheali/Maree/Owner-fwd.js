import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const forward = async (m, sock) => {
    const prefix = config.PREFIX;
    const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
    const bot = sock.decodeJid(sock.user.id);
    const dev = '923253617422@s.whatsapp.net';
    const isCreator = [dev, owner, bot].includes(m.sender);
    
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    if (!["forward", "fwd"].includes(cmd)) return;
    if (!isCreator) return;

    try {
        if (!m.quoted) {
            await sendNewsletter(
                sock,
                m.from,
                "Reply to a message to forward!",
                m,
                "🚫 Forward Error",
                "Missing quoted message"
            );
            return;
        }

        const args = m.body.split(' ').slice(1);
        if (!args[0]) {
            await sendNewsletter(
                sock,
                m.from,
                "Usage: !forward [jid1] [jid2] [jid3]...",
                m,
                "ℹ️ Forward Help",
                "Multiple targets supported"
            );
            return;
        }

        // Process all JIDs
        const successJids = [];
        const failedJids = [];
        
        for (const arg of args) {
            try {
                const targetJid = arg.includes('@') ? arg : arg + '@s.whatsapp.net';
                await sock.sendMessage(targetJid, { forward: m.quoted });
                successJids.push(targetJid);
            } catch (error) {
                failedJids.push({
                    jid: arg,
                    error: error.message
                });
            }
        }

        // Prepare result message
        let resultMessage = `✅ Successfully forwarded to ${successJids.length} targets:\n`;
        resultMessage += successJids.map(jid => `• ${jid}`).join('\n');
        
        if (failedJids.length > 0) {
            resultMessage += `\n\n❌ Failed to forward to ${failedJids.length} targets:\n`;
            resultMessage += failedJids.map(f => `• ${f.jid} (${f.error})`).join('\n');
        }

        // Send newsletter-style report
        await sendNewsletter(
            sock,
            m.from,
            resultMessage,
            m,
            "📊 Forward Results",
            `Total: ${args.length} | Success: ${successJids.length}`
        );

    } catch (error) {
        await sendNewsletter(
            sock,
            m.from,
            `Critical Error: ${error.message}`,
            m,
            "🚫 Forward Error",
            "System failure"
        );
    }
};

export default forward;
