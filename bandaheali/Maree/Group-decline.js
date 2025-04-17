import config from '../../config.cjs';

const declineall = async (m, gss) => {
    try {
        const prefix = config.PREFIX;
        const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
        if (cmd !== 'declineall') return;
        if (!m.isGroup) return m.reply("*🚫 This command only works in groups*");

        const botNumber = await gss.decodeJid(gss.user.id);
        const groupMetadata = await gss.groupMetadata(m.from);
        const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
        const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

        if (!isBotAdmin) return m.reply('*📛 Bot must be admin with "Invite" permission*');
        if (!senderAdmin) return m.reply('*📛 You must be admin to use this command*');

        let pendingRequests = [];

        // Deep inspection method
        try {
            const query = await gss.query({
                tag: 'iq',
                attrs: {
                    to: m.from,
                    type: 'get',
                    xmlns: 'w:g2',
                },
                content: [{
                    tag: 'membership_approval_requests',
                    attrs: {},
                }]
            });

            if (query.content?.[0]?.content) {
                pendingRequests = query.content[0].content.map(item => ({
                    id: item.attrs.jid,
                    added_by: item.attrs.added_by
                }));
            }
        } catch (e) {
            console.log("Deep inspection failed:", e);
            return m.reply("*❌ Couldn't fetch pending requests. Try manual decline via Group Info*");
        }

        if (pendingRequests.length === 0) {
            return m.reply(`*⚠️ No pending requests found*\nTry checking manually via Group Info > Pending Requests`);
        }

        let success = 0, fail = 0;
        const processed = new Set();

        for (const req of pendingRequests) {
            if (processed.has(req.id)) continue;
            console.log(`Trying to decline: ${req.id}`);

            try {
                // First try decline via standard API
                await gss.groupParticipantsUpdate(m.from, [req.id], 'reject');
                success++;
                processed.add(req.id);
                await new Promise(res => setTimeout(res, 1500));
            } catch (error) {
                console.log(`Standard decline failed for ${req.id}:`, error.message);

                // Fallback log only, no alt decline API in all versions
                fail++;
                await new Promise(res => setTimeout(res, 3000));
            }
        }

        let report = `*📊 Decline Results:*\n✅ Declined: ${success}\n❌ Failed: ${fail}`;
        if (fail > 0) {
            report += `\n\n*Troubleshooting:*\n1. Check bot permissions\n2. Try again later\n3. Decline manually if needed`;
        }

        await m.reply(report);

    } catch (err) {
        console.error('Command Error:', err);
        m.reply('*⚠️ System error while processing command*');
    }
};

export default declineall;
