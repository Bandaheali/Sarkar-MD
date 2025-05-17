import config from '../../config.js';

const out = async (m, gss) => {
    try {
        const prefix = config.PREFIX;
        const cmdArgs = m.body.startsWith(prefix) ? m.body.slice(prefix.length).trim().split(' ') : [];
        const cmd = cmdArgs[0]?.toLowerCase();
        const countryCode = cmdArgs[1];

        if (cmd !== 'out') return;
        if (!m.isGroup) return m.reply("*🚫 This command only works in groups*");
        if (!countryCode || isNaN(countryCode)) return m.reply("*⚠️ Please provide a valid country code*\nExample: .out 92");

        const botNumber = await gss.decodeJid(gss.user.id);
        const senderId = m.sender;
        const groupMetadata = await gss.groupMetadata(m.from);
        const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
        const senderAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin;

        if (!isBotAdmin) return m.reply('*📛 Bot must be admin to remove members*');
        if (!senderAdmin) return m.reply('*📛 You must be admin to use this command*');

        const membersToRemove = groupMetadata.participants
            .map(p => p.id)
            .filter(id =>
                (id.startsWith(`${countryCode}`) || id.startsWith(`${countryCode}@`)) &&
                id !== botNumber &&
                id !== senderId
            );

        if (membersToRemove.length === 0) {
            return m.reply(`*✅ No members found with country code +${countryCode} (excluding you and the bot)*`);
        }

        let success = 0;
        let fail = 0;

        for (const id of membersToRemove) {
            try {
                await gss.groupParticipantsUpdate(m.from, [id], 'remove');
                success++;
                await new Promise(res => setTimeout(res, 2000)); // Rate limiting
            } catch (err) {
                fail++;
                console.log(`Failed to remove ${id}:`, err.message);
                await new Promise(res => setTimeout(res, 3000));
            }
        }

        let report = `*📤 Members Removed with +${countryCode} Code:*\n✅ Removed: ${success}\n❌ Failed: ${fail}`;
        if (fail > 0) {
            report += `\n\n*Troubleshooting:*\n1. Check bot permissions\n2. Avoid using too frequently\n3. Remove manually if needed`;
        }

        await m.reply(report);

    } catch (err) {
        console.error('OUT command error:', err);
        await m.reply("*⚠️ System error while processing the out command*");
    }
};

export default out;
