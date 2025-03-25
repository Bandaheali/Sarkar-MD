import { serialize } from '../../lib/Serializer.js';
import config from '../../config.cjs';

const antilinkSettings = {}; // Stores antilink status for each group
const warnCount = {}; // Stores warnings for each user

export const handleAntilink = async (m, sock, logger, isBotAdmins, isAdmins, isCreator) => {
    const prefix = config.prefix; // Only take prefix from config
    if (!m.body.startsWith(prefix)) return; // Ignore messages with different prefixes

    const cmd = m.body.slice(prefix.length).split(' ')[0].toLowerCase();

    if (cmd === 'antilink') {
        if (!m.isGroup) {
            await sock.sendMessage(m.from, { text: 'This command can only be used in groups.' }, { quoted: m });
            return;
        }
        if (!isBotAdmins) {
            await sock.sendMessage(m.from, { text: 'The bot needs to be an admin to manage the antilink feature.' }, { quoted: m });
            return;
        }
        if (!isAdmins) {
            await sock.sendMessage(m.from, { text: 'Only admins can enable/disable the antilink feature.' }, { quoted: m });
            return;
        }

        const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/);
        const action = args[0] ? args[0].toLowerCase() : '';

        if (action === 'on') {
            antilinkSettings[m.from] = true;
            await sock.sendMessage(m.from, { text: 'Antilink feature has been enabled for this chat.' }, { quoted: m });
            return;
        }

        if (action === 'off') {
            antilinkSettings[m.from] = false;
            await sock.sendMessage(m.from, { text: 'Antilink feature has been disabled for this chat.' }, { quoted: m });
            return;
        }

        await sock.sendMessage(m.from, { text: `Usage: ${prefix + cmd} on\n ${prefix + cmd} off` }, { quoted: m });
        return;
    }

    // Antilink System
    if (antilinkSettings[m.from]) {
        if (m.body.match(/https?:\/\//gi)) { // Check for any link starting with http or https
            if (!isBotAdmins) {
                await sock.sendMessage(m.from, { text: `The bot needs to be an admin to remove links.` });
                return;
            }

            // Exclude group link of this chat
            let gclink = `https://chat.whatsapp.com/${await sock.groupInviteCode(m.from)}`;
            let isLinkThisGc = new RegExp(gclink, 'i');
            if (isLinkThisGc.test(m.body)) {
                await sock.sendMessage(m.from, { text: `The link you shared is for this group, so it's allowed.` });
                return;
            }

            if (isAdmins || isCreator) {
                await sock.sendMessage(m.from, { text: `Admins and group owners are allowed to share links.` });
                return;
            }

            let sender = m.sender;
            if (!warnCount[sender]) warnCount[sender] = 0; // Initialize warning count

            warnCount[sender] += 1; // Increase warning count

            // Send warning message
            await sock.sendMessage(m.from, {
                text: `\`\`\`「 Link Detected 」\`\`\`\n\n@${sender.split("@")[0]}, you have been warned ${warnCount[sender]}/3 times. If you send a link again, you will be removed.`,
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });

            // Delete the message
            await sock.sendMessage(m.from, {
                delete: {
                    remoteJid: m.from,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant
                }
            });

            // If user has been warned 3 times already, remove on 4th offense
            if (warnCount[sender] >= 3) {
                await sock.sendMessage(m.from, {
                    text: `@${sender.split("@")[0]} has been removed for repeatedly sharing links.`,
                    contextInfo: { mentionedJid: [sender] }
                });

                // Wait 5 seconds before removing
                setTimeout(async () => {
                    await sock.groupParticipantsUpdate(m.from, [sender], 'remove');
                }, 5000);

                // Reset warning count after removal
                delete warnCount[sender];
            }
        }
    }
};
