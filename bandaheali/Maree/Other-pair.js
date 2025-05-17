import config from '../../config.js'; // Ensure this matches your project setup
import fetch from 'node-fetch';

const pair = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === "pair") {
        if (!text) {
            return await sock.sendMessage(
                m.from,
                {
                    text: "❌ *Invalid Format!*\n\n✅ *Example:* `.pair +923477868XXX`",
                    contextInfo: {
                        forwardingScore: 999,
                        externalAdReply: {
                            title: "✨ Sarkar-MD ✨",
                            body: "Pairing Code Generator",
                            thumbnailUrl: 'https://i.imgur.com/NkUITKj.mp4', // Add any image or video if needed
                            sourceUrl: 'https://whatsapp.com/channel/0029VajGHyh2phHOH5zJl73P',
                            mediaType: 1,
                            renderLargerThumbnail: false,
                        },
                    },
                },
                { quoted: m }
            );
        }

        try {
            const apiUrl = `https://sarkar-md-session-generator.koyeb.app/pair?num=${text}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!data.success) {
                return await sock.sendMessage(
                    m.from,
                    { text: "❌ *Failed to retrieve pairing code!*\n\n📌 *Check your number and try again.*" },
                    { quoted: m }
                );
            }

            const pairingCode = data.pairing_code;

            // React with loading and success icons
            await m.React('⏳'); 
            await new Promise(resolve => setTimeout(resolve, 2000));
            await m.React('✅');

            // Send stylish alive-styled pairing message
            const responseText = `*${pairingCode}*`;

            await sock.sendMessage(
                m.from,
                {
                    text: responseText,
                    contextInfo: {
                        isForwarded: true, // Forwarding enabled
                        forwardingScore: 999,
                        externalAdReply: {
                            title: "🔥 Sarkar-MD 🔥",
                            body: "Pairing Code Generator",
                            thumbnailUrl: 'https://i.imgur.com/NkUITKj.mp4', // Add any cool image or video if needed
                            sourceUrl: 'https://whatsapp.com/channel/0029VajGHyh2phHOH5zJl73P',
                            mediaType: 1,
                            renderLargerThumbnail: false,
                        },
                    },
                },
                { quoted: m }
            );

        } catch (error) {
            console.error(error);
            await sock.sendMessage(m.from, { text: "⚠️ *An error occurred!*\n\nPlease try again later." }, { quoted: m });
        }
    }
};

export default pair;
