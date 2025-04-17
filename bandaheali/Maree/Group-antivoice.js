import config from '../../config.cjs';

const enabledGroups = new Set(); // Groups where antivoice is enabled
const warningStore = {}; // Format: { groupId: { userId: warningCount } }

const antivoice = async (m, gss) => {
    try {
        const prefix = config.PREFIX;
        const isCmd = m.body?.startsWith(prefix);
        const groupId = m.from;
        const senderId = m.sender;

        // Toggle command
        if (isCmd && m.isGroup) {
            const command = m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase();

            if (command === "antivoice") {
                const groupMetadata = await gss.groupMetadata(groupId);
                const senderAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin;

                if (!senderAdmin) return m.reply("*🚫 Only group admins can use this command*");

                if (enabledGroups.has(groupId)) {
                    enabledGroups.delete(groupId);
                    return m.reply("*❌ AntiVoice disabled in this group*");
                } else {
                    enabledGroups.add(groupId);
                    return m.reply("*✅ AntiVoice enabled in this group*\nNow non-admins cannot send voice notes.");
                }
            }
        }

        // Not voice message or not group — skip
        if (!m.isGroup || m.type !== 'audioMessage') return;

        // Check if antivoice is active in this group
        if (!enabledGroups.has(groupId)) return;

        const botNumber = await gss.decodeJid(gss.user.id);
        const groupMetadata = await gss.groupMetadata(groupId);
        const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
        const senderIsAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin;

        if (!isBotAdmin) return;
        if (senderIsAdmin) return;

        // Delete voice note
        await gss.sendMessage(groupId, {
            delete: {
                remoteJid: groupId,
                fromMe: false,
                id: m.key.id,
                participant: senderId
            }
        });

        // Init warnings
        if (!warningStore[groupId]) warningStore[groupId] = {};
        warningStore[groupId][senderId] = (warningStore[groupId][senderId] || 0) + 1;

        const count = warningStore[groupId][senderId];

        if (count < 3) {
            await gss.sendMessage(groupId, {
                text: `*⚠️ Warning ${count}/3:*\n@${senderId.split('@')[0]}, voice messages are not allowed in this group.`,
                mentions: [senderId]
            });
        } else {
            await gss.sendMessage(groupId, {
                text: `*❌ Removed:*\n@${senderId.split('@')[0]} exceeded 3 voice warnings.`,
                mentions: [senderId]
            });

            try {
                await gss.groupParticipantsUpdate(groupId, [senderId], 'remove');
            } catch (err) {
                await gss.sendMessage(groupId, {
                    text: `*❌ Couldn't remove @${senderId.split('@')[0]}*\nPlease check bot's admin permissions.`,
                    mentions: [senderId]
                });
            }

            warningStore[groupId][senderId] = 0; // Reset after kick
        }

    } catch (err) {
        console.error("AntiVoice Error:", err);
    }
};

export default antivoice;
