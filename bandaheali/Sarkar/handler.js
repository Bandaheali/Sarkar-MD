import { serialize } from '../../lib/Serializer.js';
import path from 'path';
import fs from 'fs/promises';
import config from '../../config.js';
import { handleAntilink } from './antilink.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dev = '923253617422@s.whatsapp.net';

// Function to get group admins
export const getGroupAdmins = (participants) => {
    return participants
        .filter(p => p.admin === "superadmin" || p.admin === "admin")
        .map(p => p.id);
};

const Handler = async (chatUpdate, sock, logger) => {
    try {
        if (chatUpdate.type !== 'notify' || !chatUpdate.messages?.[0]) return;

        const m = serialize(JSON.parse(JSON.stringify(chatUpdate.messages[0])), sock, logger);
        if (!m.message) return;

        // Get group metadata if it's a group message
        let participants = [];
        let groupAdmins = [];
        if (m.isGroup) {
            try {
                const metadata = await sock.groupMetadata(m.from);
                participants = metadata.participants;
                groupAdmins = getGroupAdmins(participants);
            } catch (err) {
                logger.error(`Failed to get group metadata: ${err}`);
                return;
            }
        }

        const botNumber = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = m.isGroup ? groupAdmins.includes(botNumber) : false;
        const isAdmin = m.isGroup ? groupAdmins.includes(m.sender) : false;

        // Handle status updates
        if (m.key?.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
            await sock.readMessages([m.key]).catch(err => 
                logger.error(`Failed to mark status as read: ${err}`)
            );
        }

        // Check if sender is owner/creator
        const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
        const isCreator = [dev, ownerNumber, botNumber].includes(m.sender);

        // If bot is private, only respond to creator
        if (!sock.public && !isCreator) {
            return;
        }

        // Handle antilink functionality
        await handleAntilink(m, sock, logger, isBotAdmin, isAdmin, isCreator);

        // Load and execute plugins
        const pluginDir = path.join(__dirname, '..', 'Maree');
        try {
            const pluginFiles = (await fs.readdir(pluginDir)).filter(file => file.endsWith('.js'));
            
            for (const file of pluginFiles) {
                const pluginPath = path.join(pluginDir, file);
                try {
                    const pluginModule = await import(`file://${pluginPath}`);
                    if (typeof pluginModule.default === 'function') {
                        await pluginModule.default(m, sock);
                    }
                } catch (err) {
                    logger.error(`Failed to execute plugin ${file}: ${err}`);
                }
            }
        } catch (err) {
            logger.error(`Failed to read plugin directory: ${err}`);
        }

    } catch (e) {
        logger.error(`Handler error: ${e}`);
    }
};

export default Handler;
