import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';
import os from 'os';
import process from 'process';

const alive2 = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    
    if (cmd !== 'alive2') return;

    try {
        // Get system information
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const totalMem = (os.totalmem() / (1024 * 1024)).toFixed(2);
        const freeMem = (os.freemem() / (1024 * 1024)).toFixed(2);
        const usedMem = (os.totalmem() - os.freemem()) / (1024 * 1024);
        const usagePercent = ((usedMem / (os.totalmem() / (1024 * 1024))) * 100).toFixed(2);
        
        const cpus = os.cpus();
        const cpuModel = cpus[0].model;
        const cpuSpeed = (cpus[0].speed / 1000).toFixed(2);
        const cpuCores = cpus.length;

        // Prepare response
        const response = `*🤖 BOT STATUS 2.0*\n\n` +
            `*🟢 Status:* Online\n` +
            `*⏳ Uptime:* ${hours}h ${minutes}m ${seconds}s\n` +
            `*📊 Memory:* ${usedMem.toFixed(2)}MB / ${totalMem}MB (${usagePercent}%)\n` +
            `*🆓 Free Memory:* ${freeMem}MB\n` +
            `*⚡ CPU:* ${cpuModel}\n` +
            `*🔢 Cores:* ${cpuCores}\n` +
            `*🚀 Speed:* ${cpuSpeed} GHz\n` +
            `*📱 Platform:* ${os.platform()}\n` +
            `*🔄 Node.js:* ${process.version}\n\n` +
            `*⚡ Powered by:* ${config.BOT_NAME || 'Sarkar'}`;

        // Send response with newsletter formatting
        await sendNewsletter(
            sock,
            m.from,
            response,
            m,
            "🤖 Bot Status",
            "System Information"
        );
        
        await m.React('✅');

    } catch (error) {
        console.error(error);
        await sock.sendMessage(
            m.from,
            { text: "⚠️ *Error fetching system information!*" },
            { quoted: m }
        );
        await m.React('❌');
    }
};

export default alive2;
