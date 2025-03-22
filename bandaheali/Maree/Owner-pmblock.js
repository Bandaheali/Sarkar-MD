import config from '../../config.cjs';

const pmWarnings = {}; // Store user warnings

const pmBlockHandler = async (m, sock) => {
    try {
        if (!config.PM_BLOCK) return; // Skip if PM_BLOCK is disabled
        if (m.key.remoteJid.includes('@g.us')) return; // Ignore group messages

        const sender = m.key.remoteJid; // Get sender's JID
        const botNumber = await sock.decodeJid(sock.user.id); // Get bot number
        const ownerNumbers = config.OWNER_NUMBER.map(num => num.replace(/\D/g, '') + '@s.whatsapp.net'); // Convert owner numbers to JID format

        if ([botNumber, ...ownerNumbers].includes(sender)) return; // Ignore bot & owner

        // Initialize warning count if user is new
        if (!pmWarnings[sender]) pmWarnings[sender] = 0;

        pmWarnings[sender] += 1; // Increase warning count

        if (pmWarnings[sender] <= 3) {
            let remainingWarnings = 4 - pmWarnings[sender]; 
            let warningMessage = `⚠️ *Warning ${pmWarnings[sender]}/3* ⚠️\n\nPrivate messages are not allowed!\nYou will be blocked after ${remainingWarnings} more warning(s).`;
            await sock.sendMessage(sender, { text: warningMessage }, { quoted: m });
        } else {
            await sock.updateBlockStatus(sender, 'block'); // Block the user
            delete pmWarnings[sender]; // Remove user from warnings list
            console.log(`🚫 Blocked user: ${sender} for spamming in PM.`);
        }

    } catch (error) {
        console.error("❌ PM Block Error:", error);
    }
};

export default pmBlockHandler;
