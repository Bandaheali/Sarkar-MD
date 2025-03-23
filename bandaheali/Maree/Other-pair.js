import config from '../../config.cjs'; // Ensure this matches your project setup
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
                { text: "❌ *Invalid Format!*\n\n✅ *Example:* `.pair +923477868XXX`" },
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

            // Step 1: React with loading emoji
            await m.react('⏳'); 

            // Step 2: Send "Pairing Code Generator" message
            await sock.sendMessage(
                m.from,
                { text: "🔥 *SARKAR-MD Pairing Code Generator*\n\n⏳ *Generating Code...*" },
                { quoted: m }
            );

            // Step 3: Wait for 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 4: React with success emoji
            await m.react('✅');

            // Step 5: Send only the pairing code
            await sock.sendMessage(m.from, { text: pairingCode }, { quoted: m });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(m.from, { text: "⚠️ *An error occurred!*\n\nPlease try again later." }, { quoted: m });
        }
    }
};

export default pair;
