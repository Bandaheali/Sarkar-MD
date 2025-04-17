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
            // Get pending requests - method varies by WhatsApp version
            let pendingRequests = [];
            try {
                pendingRequests = await gss.groupFetchAllParticipating();
                pendingRequests = pendingRequests[m.from]?.pendingRequests || [];
            } catch (e) {
                console.log("Alternative method failed:", e);
                return m.reply("*❌ Couldn't fetch pending requests. Try manual approval.*");
            }

            if (pendingRequests.length === 0) {
                return m.reply('*ℹ No pending join requests found*');
            }

            // Process approvals with rate limiting
            let successCount = 0;
            let failCount = 0;
            const failReasons = [];

            for (const request of pendingRequests) {
                try {
                    await gss.groupParticipantsUpdate(
                        m.from,
                        [request.id],
                        'approve'
                    );
                    successCount++;
                    
                    // Critical delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 2500));
                    
                } catch (error) {
                    failCount++;
                    const reason = error.message.includes('401') ? 'No permission' :
                                 error.message.includes('404') ? 'User not found' :
                                 error.message.includes('500') ? 'Server error' :
                                 'Unknown error';
                    failReasons.push(`${request.id.split('@')[0]}: ${reason}`);
                    
                    // Longer delay after failures
                    await new Promise(resolve => setTimeout(resolve, 4000));
                }
            }

            // Prepare report
            let report = `*📊 Approval Results:*\n`;
            report += `✅ Success: ${successCount}\n`;
            report += `❌ Failed: ${failCount}\n`;
            
            if (failCount > 0) {
                report += `\n*Common Reasons:*\n`;
                report += `- User privacy settings\n`;
                report += `- Already in group\n`;
                report += `- WhatsApp API limits\n\n`;
                report += `*Failed IDs:*\n${failReasons.slice(0, 5).join('\n')}`;
                if (failReasons.length > 5) report += `\n...and ${failReasons.length-5} more`;
            }

            await m.reply(report);

        } catch (error) {
            console.error('Main approval error:', error);
            await m.reply(`*❌ Critical error: ${error.message.includes('timed out') ? 
                          'Operation timed out' : 
                          'API request failed'}*\nTry again later or approve manually.`);
        }
    } catch (error) {
        console.error('Command error:', error);
        m.reply('*⚠️ System error processing command*');
    }
};

export default approveall;
