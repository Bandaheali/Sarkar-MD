import { serialize } from '../../lib/Serializer.js';

const antilinkSettings = {}; // Stores antilink settings for each chat
const warningCounts = {}; // Stores warning counts for each user in each chat

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
                warningCounts[m.from] = {}; // Reset warnings when enabling
                await sock.sendMessage(m.from, { text: 'Antilink feature has been enabled for this chat.' }, { quoted: m });
            } else {
                await sock.sendMessage(m.from, { text: 'Only admins can enable the antilink feature.' }, { quoted: m });
            }
            return;
        }

        if (action === 'off') {
            if (isAdmins) {
                antilinkSettings[m.from] = false;
                warningCounts[m.from] = {}; // Clear warnings when disabling
                await sock.sendMessage(m.from, { text: 'Antilink feature has been disabled for this chat.' }, { quoted: m });
            } else {
                await sock.sendMessage(m.from, { text: 'Only admins can disable the antilink feature.' }, { quoted: m });
            }
            return;
        }

        await sock.sendMessage(m.from, { text: `Usage: ${prefix + cmd} on\n${prefix + cmd} off` }, { quoted: m });
        return;
    }

    if (antilinkSettings[m.from]) {
        // ✅ Updated Regex: Now detects **all types of links**
        const linkRegex = /(https?:\/\/[^\s]+)/gi;

        if (m.body.match(linkRegex)) {
            if (!isBotAdmins) {
                await sock.sendMessage(m.from, { text: `The bot needs to be an admin to remove links.` });
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

            // Initialize warnings if not already set
            if (!warningCounts[m.from]) {
                warningCounts[m.from] = {};
            }
            if (!warningCounts[m.from][m.sender]) {
                warningCounts[m.from][m.sender] = 0;
            }

            warningCounts[m.from][m.sender] += 1; // Increase warning count

            // Delete the message
            await sock.sendMessage(m.from, {
                delete: {
                    remoteJid: m.from,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant
                }
            });

            if (warningCounts[m.from][m.sender] < 3) {
                await sock.sendMessage(m.from, {
                    text: `\`\`\`「 Link Detected 」\`\`\`\n\n@${m.sender.split("@")[0]}, please do not share links in this group.\n\n⚠️ Warning: ${warningCounts[m.from][m.sender]}/3`,
                    contextInfo: { mentionedJid: [m.sender] }
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.from, {
                    text: `🚨 @${m.sender.split("@")[0]} has been removed from the group for sharing links multiple times.`,
                    contextInfo: { mentionedJid: [m.sender] }
                });

                // Remove user from group after 5 seconds
                setTimeout(async () => {
                    await sock.groupParticipantsUpdate(m.from, [m.sender], 'remove');
                }, 5000);

                // Reset warning count for the removed user
                delete warningCounts[m.from][m.sender];
            }
        }
    }
};
