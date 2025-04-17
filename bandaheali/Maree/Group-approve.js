import config from '../../config.cjs';

const approveall = async (m, gss) => {
    try {
        const prefix = config.PREFIX;
        const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
        
        if (cmd !== 'approveall') return;
        if (!m.isGroup) return m.reply("*🚫 This command only works in groups*");

        // Admin verification
        const botNumber = await gss.decodeJid(gss.user.id);
        const groupMetadata = await gss.groupMetadata(m.from);
        const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
        const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

        if (!isBotAdmin) return m.reply('*📛 Bot must be admin with "Invite" permission*');
        if (!senderAdmin) return m.reply('*📛 You must be admin to use this command*');

        try {
            // Method 1: Standard API check
            let pendingRequests = [];
            
            // Method 2: Alternative check for newer WhatsApp versions
            try {
                const groupData = await gss.groupMetadata(m.from);
                pendingRequests = groupData.pendingRequests || [];
            } catch (e) {
                console.log("Standard method failed:", e);
            }

            // Method 3: Deep inspection fallback
            if (pendingRequests.length === 0) {
                try {
                    const inviteCode = await gss.groupInviteCode(m.from);
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
                }
            }

            if (pendingRequests.length === 0) {
                return m.reply(`*⚠️ No pending requests found*\n\nNote: Some requests may not be visible to bots due to:\n1. WhatsApp privacy settings\n2. Recent API changes\n3. Group settings\n\nTry approving manually via Group Info > Pending Requests`);
            }

            // Process approvals with careful rate limiting
            let successCount = 0;
            let failCount = 0;
            const processed = new Set();

            for (const request of pendingRequests) {
                if (processed.has(request.id)) continue;
                
                try {
                    await gss.groupParticipantsUpdate(
                        m.from,
                        [request.id],
                        'approve'
                    );
                    successCount++;
                    processed.add(request.id);
                    
                    // Dynamic delay based on success rate
                    const delay = failCount > successCount ? 4000 : 2000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                } catch (error) {
                    failCount++;
                    console.log(`Failed to approve ${request.id}:`, error.message);
                    
                    // Longer delay after failures
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }

            // Detailed report
            let report = `*📊 Approval Results:*\n`;
            report += `✅ Approved: ${successCount}\n`;
            report += `❌ Failed: ${failCount}\n`;
            
            if (failCount > 0) {
                report += `\n*Possible Solutions:*\n`;
                report += `1. Try again later\n`;
                report += `2. Approve manually in group settings\n`;
                report += `3. Check bot admin permissions\n`;
            }

            await m.reply(report);

        } catch (error) {
            console.error('Approval error:', error);
            await m.reply(`*❌ Critical error: ${error.message}*\nTry manual approval via Group Info > Pending Requests`);
        }
    } catch (error) {
        console.error('Command error:', error);
        m.reply('*⚠️ System error processing command*');
    }
};

export default approveall;
