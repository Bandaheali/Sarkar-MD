import { serialize } from '../../lib/Serializer.js';

const antilinkSettings = {}; // In-memory database for antilink settings
const userWarnings = {}; // Store user warning count

export const handleAntilink = async (m, sock, logger, isBotAdmins, isAdmins, isCreator) => {
    const PREFIX = /^[\\/!#.]/;
    const isCOMMAND = (body) => PREFIX.test(body);
    const prefixMatch = isCOMMAND(m.body) ? m.body.match(PREFIX) : null;
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    if (cmd === 'antilink') {
        const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/);
        const action = args[0] ? args[0].toLowerCase() : '';

        if (!m.isGroup) {
            await sock.sendMessage(m.from, { text: 'This command can only be used in groups.' }, { quoted: m });
            return;
        }

        if (!isBotAdmins) {
            await sock.sendMessage(m.from, { text: 'The bot needs to be an admin to manage the antilink feature.' }, { quoted: m });
            return;
        }

        if (action === 'on') {
            if (isAdmins) {
                antilinkSettings[m.from] = true;
                await sock.sendMessage(m.from, { text: 'Antilink feature has been enabled for this group.' }, { quoted: m });
            } else {
                await sock.sendMessage(m.from, { text: 'Only admins can enable the antilink feature.' }, { quoted: m });
            }
            return;
        }

        if (action === 'off') {
            if (isAdmins) {
                antilinkSettings[m.from] = false;
                await sock.sendMessage(m.from, { text: 'Antilink feature has been disabled for this group.' }, { quoted: m });
            } else {
                await sock.sendMessage(m.from, { text: 'Only admins can disable the antilink feature.' }, { quoted: m });
            }
            return;
        }

        await sock.sendMessage(m.from, { text: `Usage: ${prefix + cmd} on\n${prefix + cmd} off` }, { quoted: m });
        return;
    }

    if (antilinkSettings[m.from]) {
        if (m.body.match(/(chat.whatsapp.com\/)/gi)) {
            if (!isBotAdmins) {
                await sock.sendMessage(m.from, { text: `The bot needs to be an admin to remove links.` });
                return;
            }

            let gclink = `https://chat.whatsapp.com/${await sock.groupInviteCode(m.from)}`;
            let isLinkThisGc = new RegExp(gclink, 'i');
            let isgclink = isLinkThisGc.test(m.body);

            if (isgclink) {
                await sock.sendMessage(m.from, { text: `The link you shared is for this group, so you won't be removed.` });
                return;
            }
            if (isAdmins) {
                await sock.sendMessage(m.from, { text: `Admins are allowed to share links.` });
                return;
            }
            if (isCreator) {
                await sock.sendMessage(m.from, { text: `The owner is allowed to share links.` });
                return;
            }

            // Initialize warning count if not exists
            if (!userWarnings[m.sender]) {
                userWarnings[m.sender] = 1;
            } else {
                userWarnings[m.sender]++;
            }

            if (userWarnings[m.sender] < 4) {
                // Send warning message
                await sock.sendMessage(m.from, {
                    text: `\`\`\`「 Group Link Detected 」\`\`\`\n\n@${m.sender.split("@")[0]}, please do not share group links in this group.\nWarning: ${userWarnings[m.sender]}/3`,
                    contextInfo: { mentionedJid: [m.sender] }
                }, { quoted: m });

                // Delete message
                await sock.sendMessage(m.from, {
                    delete: {
                        remoteJid: m.from,
                        fromMe: false,
                        id: m.key.id,
                        participant: m.key.participant
                    }
                });
            } else {
                // If 4th warning, remove user
                await sock.sendMessage(m.from, {
                    text: `\`\`\`「 Group Link Detected 」\`\`\`\n\n@${m.sender.split("@")[0]} has been removed for repeatedly sharing group links.`,
                    contextInfo: { mentionedJid: [m.sender] }
                });

                await sock.groupParticipantsUpdate(m.from, [m.sender], 'remove');

                // Reset warning count after removal
                delete userWarnings[m.sender];
            }
        }
    }
};
