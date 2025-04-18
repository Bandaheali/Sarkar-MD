import config from '../../config.cjs';

const pmWarnings = {}; // Store user warnings

const pmBlockHandler = async (m, sock) => {
    try {
        if (!config.PM_BLOCK) return; // Skip if PM_BLOCK is disabled
        
        // Only handle private chats (not groups and not newsletters)
        if (!m.key.remoteJid.endsWith('@s.whatsapp.net')) return;

        const sender = m.key.remoteJid; // Get sender's JID
        const botNumber = await sock.decodeJid(sock.user.id); // Get bot number
        const ownerNumbers = config.OWNER_NUMBER.map(num => 
            num.replace(/\D/g, '') + '@s.whatsapp.net'
        ); // Convert owner numbers to JID format

        // Allowed numbers (bot, owners, and config.ALLOWED_NUMBER if exists)
        const allowedNumbers = [
            botNumber, 
            ...ownerNumbers,
            ...(config.ALLOWED_NUMBER || []).map(num => 
                num.replace(/\D/g, '') + '@s.whatsapp.net'
            )
        ];

        // Ignore allowed numbers
        if (allowedNumbers.includes(sender)) return;

        // Check if message contains any content (text, image, video, audio, sticker, etc.)
        const hasContent = m.message && (
            m.message.conversation || // text
            m.message.imageMessage || // image
            m.message.videoMessage || // video
            m.message.audioMessage || // audio (including PTT)
            m.message.stickerMessage || // sticker
            m.message.extendedTextMessage // quoted/long messages
        );

        if (!hasContent) return; // Skip if no actual content

        // Initialize warning count if user is new
        if (!pmWarnings[sender]) pmWarnings[sender] = 0;

        pmWarnings[sender] += 1; // Increase warning count

        if (pmWarnings[sender] <= 3) {
            let remainingWarnings = 3 - pmWarnings[sender];
            let warningMessage = `⚠️ *Warning ${pmWarnings[sender]}/3* ⚠️\n\n` +
                                `Private messages are not allowed!\n` +
                                `You will be blocked after ${remainingWarnings} more warning(s).\n\n` +
                                `_This includes text, media, voice notes, and stickers._`;
            await sock.sendMessage(sender, { text: warningMessage }, { quoted: m });
        } else {
            await sock.updateBlockStatus(sender, 'block'); // Block the user
            delete pmWarnings[sender]; // Remove user from warnings list
            console.log(`🚫 Blocked user: ${sender} for spamming in PM.`);
            
            // Notify owner
            if (config.OWNER_NUMBER.length > 0) {
                await sock.sendMessage(
                    ownerNumbers[0], 
                    { 
                        text: `🚫 Blocked user: ${sender}\n` +
                              `Reason: Sent multiple private messages (text/media/voice/stickers)`
                    }
                );
            }
        }

    } catch (error) {
        console.error("❌ PM Block Error:", error);
    }
};

export default pmBlockHandler;
