import config from '../../config.cjs';

const pmWarnings = {}; // Store user warnings

const pmBlockHandler = async (m, sock) => {
    try {
        // Skip if PM_BLOCK is disabled or not a private chat
        if (!config.PM_BLOCK || !m.key.remoteJid.endsWith('@s.whatsapp.net')) return;

        const sender = m.key.remoteJid;
        const botNumber = await sock.decodeJid(sock.user.id);
        const ownerNumbers = config.OWNER_NUMBER.map(num => 
            num.replace(/\D/g, '') + '@s.whatsapp.net'
        );

        // Allowed numbers list
        const allowedNumbers = [
            botNumber, 
            ...ownerNumbers,
            ...(config.ALLOWED_NUMBER || []).map(num => 
                num.replace(/\D/g, '') + '@s.whatsapp.net'
            )
        ];

        // Skip allowed numbers
        if (allowedNumbers.includes(sender)) return;

        // Skip all reactions and non-text messages
        if (m.message?.reactionMessage || !m.message?.conversation) return;

        // Only process pure text messages
        const text = m.message.conversation;

        // Initialize warning count
        if (!pmWarnings[sender]) pmWarnings[sender] = 0;

        pmWarnings[sender] += 1; // Increment warning

        if (pmWarnings[sender] <= 3) {
            const remaining = 3 - pmWarnings[sender];
            await sock.sendMessage(sender, { 
                text: `⚠️ *Warning ${pmWarnings[sender]}/3*\n\n` +
                      `Text messages not allowed in PM!\n` +
                      `Next violation will result in block.`
            }, { quoted: m });
        } else {
            await sock.updateBlockStatus(sender, 'block');
            delete pmWarnings[sender];
            
            // Notify owner
            if (ownerNumbers.length > 0) {
                await sock.sendMessage(
                    ownerNumbers[0], 
                    { text: `🚫 Blocked ${sender} for texting in PM` }
                );
            }
        }

    } catch (error) {
        console.error("PM Block Error:", error);
    }
};

export default pmBlockHandler;
