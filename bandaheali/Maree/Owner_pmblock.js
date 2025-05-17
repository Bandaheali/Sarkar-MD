import config from '../../config.js';
import fetch from 'node-fetch';

// Store warning counts for each user
const warningCounts = new Map();

const pm_block = async (m, Matrix) => {
    const Status = config.PM_BLOCK || false;
    const dev = "923253617422@s.whatsapp.net";
    const isGroup = m.key.remoteJid.endsWith("@g.us");
    
    // Return if PM_BLOCK is false
    if (!Status) return;

    // Ignore if message is from group or newsletter
    if (isGroup || m.key.remoteJid.endsWith("@newsletter")) return;

    // Get allowed numbers (bot, owner, dev + config.ALLOWED_NUMBER)
    const bot = await Matrix.decodeJid(Matrix.user.id);
    const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
    const allowedNumbers = config.ALLOWED_NUMBER || [];
    const isAllowed = [
        bot, 
        owner, 
        dev,
        ...allowedNumbers.map(num => num.includes('@') ? num : num + '@s.whatsapp.net')
    ];

    // If sender is allowed, return
    if (!m.sender || isAllowed.includes(m.sender)) return;

    // Get current warning count
    const currentWarnings = warningCounts.get(m.sender) || 0;
    
    if (currentWarnings >= 3) {
        // Block the user after 3 warnings
        await Matrix.updateBlockStatus(m.sender, "block");
        warningCounts.delete(m.sender); // Clean up
        return await Matrix.sendMessage(
            owner, 
            { text: `User ${m.sender} has been blocked after 3 warnings.` }
        );
    }

    // Increment warning count
    warningCounts.set(m.sender, currentWarnings + 1);
    
    // Send warning message
    const warningMsg = `⚠️ Warning ${currentWarnings + 1}/3:\n` +
                      `Please don't message here. You will be blocked after ${3 - (currentWarnings + 1)} more warnings.`;
    
    await Matrix.sendMessage(m.sender, { text: warningMsg }, { quoted: m });
    
    // Notify owner about the warning
    if (currentWarnings + 1 === 3) {
        await Matrix.sendMessage(
            owner, 
            { text: `User ${m.sender} will be blocked on next message.` }
        );
    }
};

export default pm_block;
