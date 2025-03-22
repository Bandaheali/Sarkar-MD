import config from '../../config.cjs';

const pmWarnings = {}; // Store user warnings

const pmBlockHandler = async (m, Matrix, sock) => {
    try {
        if (!config.PM_BLOCK || m.key.remoteJid.includes('@g.us')) return; // Ignore if PM_BLOCK is off or it's a group

        const sender = m.sender;
        const botNumber = await sock.decodeJid(sock.user.id); // Get bot number
        const ownerNumber = config.OWNER_NUMBER; // Ensure it's an array

        if ([botNumber, ...ownerNumber].includes(sender)) return; // Ignore bot & owner

        // Initialize warning count if user is new
        if (!pmWarnings[sender]) pmWarnings[sender] = 0;

        pmWarnings[sender] += 1; // Increase warning count

        if (pmWarnings[sender] <= 3) {
            let remainingWarnings = 4 - pmWarnings[sender]; 
            let warningMessage = `⚠️ *Warning ${pmWarnings[sender]}/3* ⚠️\n\nPrivate messages are not allowed!\nYou will be blocked after ${remainingWarnings} more warning(s).`;
            await Matrix.sendMessage(sender, { text: warningMessage });
        } else {
            await Matrix.blockUser(sender); // Block the user
            delete pmWarnings[sender]; // Remove user from warnings list
            console.log(`Blocked user: ${sender} for spamming in PM.`);
        }

    } catch (error) {
        console.error("PM Block Error:", error);
    }
};

export default pmBlockHandler;
