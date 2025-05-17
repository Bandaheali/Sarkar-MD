import config from '../../config.js';

const enabledGroups = new Set(); // Groups with antimeda ON
const warningStore = {}; // { groupId: { userId: count } }

const antimedia = async (m, gss) => {
    try {
        const prefix = config.PREFIX;
        const isCmd = m.body?.startsWith(prefix);
        const groupId = m.from;
        const senderId = m.sender;

        // Command to toggle antimedia
        if (isCmd && m.isGroup) {
            const command = m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase();

            if (command === "antimedia") {
                const groupMetadata = await gss.groupMetadata(groupId);
                const senderAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin;

                if (!senderAdmin) return m.reply("*🚫 Only group admins can use this command*");

                if (enabledGroups.has(groupId)) {
                    enabledGroups.delete(groupId);
                    return m.reply("*❌ AntiMedia disabled in this group*");
                } else {
                    enabledGroups.add(groupId);
                    return m.reply("*✅ AntiMedia enabled in this group*\nNow non-admins cannot send any media.");
                }
            }
        }

        // If not in enabled group, ignore
        if (!enabledGroups.has(groupId)) return;

        // Check for media types
        const mediaTypes = [
            'imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage',
            'documentMessage', 'contactMessage', 'locationMessage'
        ];

        if (!m.isGroup || !mediaTypes.includes(m.type)) return;

        const botNumber = await gss.decodeJid(gss.user.id);
        const groupMetadata = await gss.groupMetadata(groupId);
        const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
        const senderIsAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin;

        if (!isBotAdmin || senderIsAdmin) return;

        // Delete media message
        await gss.sendMessage(groupId, {
            delete: {
                remoteJid: groupId,
                fromMe: false,
                id: m.key.id,
                participant: senderId
            }
        });

        // Warnings init
        if (!warningStore[groupId]) warningStore[groupId] = {};
        warningStore[groupId][senderId] = (warningStore[groupId][senderId] || 0) + 1;

        const warnCount = warningStore[groupId][senderId];

        if (warnCount < 3) {
            await gss.sendMessage(groupId, {
                text: `*⚠️ Warning ${warnCount}/3:*\n@${senderId.split('@')[0]}, media is not allowed here.`,
                mentions: [senderId]
            });
        } else {
            await gss.sendMessage(groupId, {
                text: `*❌ Removed:*\n@${senderId.split('@')[0]} exceeded 3 media warnings.`,
                mentions: [senderId]
            });

            try {
                await gss.groupParticipantsUpdate(groupId, [senderId], 'remove');
            } catch (err) {
                await gss.sendMessage(groupId, {
                    text: `*❌ Couldn't remove @${senderId.split('@')[0]}*\nCheck bot's admin permissions.`,
                    mentions: [senderId]
                });
            }

            warningStore[groupId][senderId] = 0; // Reset after removal
        }

    } catch (err) {
        console.error("AntiMedia Error:", err);
    }
};

export default antimedia;
