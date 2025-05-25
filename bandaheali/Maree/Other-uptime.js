import os from 'os';
import process from 'process';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const uptime = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (cmd !== "uptime") return;

    try {
        // Calculate uptime
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);

        // System stats
        const totalMem = (os.totalmem() / (1024 * 1024)).toFixed(2);
        const freeMem = (os.freemem() / (1024 * 1024)).toFixed(2);
        const loadAvg = os.loadavg()[0].toFixed(2);
        const platform = `${os.platform()} (${os.arch()})`;

        // Format message
        const statusMessage = `
⚡ *Sarkar-MD UpTime Status* ⚡

⏱️ *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
🧠 *Memory:* ${freeMem}MB free / ${totalMem}MB total
📊 *CPU Load:* ${loadAvg}
💻 *Platform:* ${platform}
🔄 *Node.js:* ${process.version}

🌐 *Bot Version:* ${config.VERSION || '1.0.0'}
🔌 *Commands Loaded:* ${Object.keys(config.COMMANDS || {}).length}
`;

        await sendNewsletter(
            sock,
            m.from,
            statusMessage,
            m,
            "🖥️ System Status",
            "Keep Using Sarkar-MD",
            "https://i.imgur.com/JQ9w8VK.png" // Server icon
        );

        await m.React('✅');

    } catch (error) {
        console.error("Uptime Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Failed to get status*\n\nServer metrics unavailable",
            m,
            "🖥️ System Status",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default uptime;
