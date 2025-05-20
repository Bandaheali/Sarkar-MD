import config from '../../config.js';

/**
 * Send a message with newsletter-style forwarding
 * @param {object} sock - WhatsApp socket
 * @param {string} to - Recipient JID
 * @param {string} text - Message text
 * @param {object} quoted - Quoted message (optional)
 * @param {string} title - Title for externalAdReply
 * @param {string} body - Body for externalAdReply
 */
export const sendNewsletter = async (sock, to, text, quoted = null, title = "✨ Sarkar-MD ✨", body = "System Message") => {
    try {
        await sock.sendMessage(
            to,
            {
                text: text,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363315182578784@newsletter',
                        newsletterName: "Sarkar-MD",
                        serverMessageId: -1,
                    },
                    forwardingScore: 999,
                    externalAdReply: {
                        title: title,
                        body: body,
                        thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/main/Pairing/1733805817658.webp',
                        sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                    },
                },
            },
            { quoted: quoted }
        );
    } catch (error) {
        console.error("Failed to send newsletter-style message:", error);
        throw error;
    }
};

/**
 * Forward a message with newsletter styling
 * @param {object} sock - WhatsApp socket
 * @param {string} to - Target JID
 * @param {object} quotedMsg - Quoted message to forward
 * @param {object} quoted - Quoted message (optional)
 */
export const forwardNewsletter = async (sock, to, quotedMsg, quoted = null) => {
    try {
        await sock.sendMessage(
            to,
            {
                forward: quotedMsg,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363315182578784@newsletter',
                        newsletterName: "Sarkar-MD",
                        serverMessageId: -1,
                    },
                    forwardingScore: 999,
                    externalAdReply: {
                        title: "✨ Sarkar-MD ✨",
                        body: "Forwarded Message",
                        thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/main/Pairing/1733805817658.webp',
                        sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                    },
                },
            },
            { quoted: quoted }
        );
    } catch (error) {
        console.error("Failed to forward newsletter-style message:", error);
        throw error;
    }
};
