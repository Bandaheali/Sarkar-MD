import config from '../../config.cjs';

const pmWarnings = {}; // Store user warnings

const pmBlockHandler = async (m, sock) => {
    try {
        if (!config.PM_BLOCK) return; // Skip if PM_BLOCK is disabled
        
        // Only handle private chats
        if (!m.key.remoteJid.endsWith('@s.whatsapp.net')) return;

        const sender = m.key.remoteJid;
        const botNumber = await sock.decodeJid(sock.user.id);
        const ownerNumbers = config.OWNER_NUMBER.map(num => 
            num.replace(/\D/g, '') + '@s.whatsapp.net'
        );

        // Allowed numbers
        const allowedNumbers = [
            botNumber, 
            ...ownerNumbers,
            ...(config.ALLOWED_NUMBER || []).map(num => 
                num.replace(/\D/g, '') + '@s.whatsapp.net'
            )
        ];

        // Ignore allowed numbers
        if (allowedNumbers.includes(sender)) return;

        // Only check for text messages
        const text = m.message?.conversation || m.message?.extendedTextMessage?.text;
        if (!text) return; // Skip if not a text message

        // Initialize warning count
        if (!pmWarnings[sender]) pmWarnings[sender] = 0;

        pmWarnings[sender] += 1; // Increase warning count

        if (pmWarnings[sender] <= 3) {
            let remainingWarnings = 3 - pmWarnings[sender];
            let warningMessage = `⚠️ *Warning ${pmWarnings[sender]}/3* ⚠️\n\n` +
                              `Text messages are not allowed in PM!\n` +
                              `You will be blocked after ${remainingWarnings} more warning(s).`;
            await sock.sendMessage(sender, { text: warningMessage }, { quoted: m });
        } else {
            await sock.updateBlockStatus(sender, 'block');
            delete pmWarnings[sender];
            console.log(`🚫 Blocked user: ${sender} for sending text messages in PM.`);
            
            // Notify owner
            if (config.OWNER_NUMBER.length > 0) {
                await sock.sendMessage(
                    ownerNumbers[0], 
                    { text: `🚫 Blocked user: ${sender} for sending text messages in PM` }
                );
            }
        }

    } catch (error) {
        console.error("❌ PM Block Error:", error);
    }
};

export default pmBlockHandler;
