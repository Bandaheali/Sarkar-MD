import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';

const allMenus = async (m, sock) => {
    const prefix = config.PREFIX;
    const mode = config.MODE;
    const name = config.BOT_NAME;
    const owner = config.OWNER_NAME;
    const pushName = m.pushName || 'User';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    // Command: getpp (get profile picture)
    if (cmd === "getpp") {
        await m.React('⏳');
        
        if (!m.quoted) {
            await sock.sendMessage(m.from, { text: "Please reply to a user's message to get their profile picture." }, { quoted: m });
            await m.React('❌');
            return;
        }

        const quotedUser = m.quoted.sender;
        const user = await sock.onWhatsApp(quotedUser);
        
        if (!user || !user[0] || !user[0].exists) {
            await sock.sendMessage(m.from, { text: "User not found." }, { quoted: m });
            await m.React('❌');
            return;
        }

        try {
            const ppUrl = await sock.profilePictureUrl(quotedUser, 'image');
            const userName = m.quoted.pushName || "User";
            
            await sock.sendMessage(
                m.from,
                {
                    image: { url: ppUrl },
                    caption: `Here is the profile picture of @${quotedUser.split('@')[0]}`,
                    mentions: [quotedUser]
                },
                { quoted: m }
            );
            await m.React('✅');
        } catch (error) {
            console.error(error);
            await sock.sendMessage(m.from, { text: "Failed to get profile picture. The user may not have one set." }, { quoted: m });
            await m.React('❌');
        }
    }
};

export default allMenus;
