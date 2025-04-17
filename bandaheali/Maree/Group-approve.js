import config from '../../config.cjs';

const approveall = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    if (cmd !== 'approveall') return;
    if (!m.isGroup) return m.reply("*🚫 This command only works in groups*");

    const botNumber = await gss.decodeJid(gss.user.id);
    const groupMetadata = await gss.groupMetadata(m.from);
    const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
    const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

    if (!isBotAdmin) return m.reply('*📛 Bot must be admin to approve requests*');
    if (!senderAdmin) return m.reply('*📛 You must be admin to use this command*');

    try {
      // Alternative method to get pending requests
      const groupInvites = await gss.fetchGroupMetadataFromWA(m.from);
      if (!groupInvites.pendingRequests || groupInvites.pendingRequests.length === 0) {
        return m.reply('*ℹ No pending join requests found*');
      }

      // Approve all requests
      const results = [];
      for (const request of groupInvites.pendingRequests) {
        try {
          await gss.groupRequestParticipantsUpdate(
            m.from,
            [request.jid],
            'approve'
          );
          results.push({ success: true, jid: request.jid });
        } catch (e) {
          results.push({ success: false, jid: request.jid, error: e.message });
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to avoid rate limiting
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      // Send report
      let report = `*📊 Approval Results:*\n`;
      report += `✅ Approved: ${successful}\n`;
      report += `❌ Failed: ${failed}\n\n`;
      report += `_Note: Some approvals may fail due to privacy settings or if users already joined._`;

      await m.reply(report);

    } catch (error) {
      console.error('Approveall error:', error);
      await m.reply(`*❌ Error: ${error.message.includes('401') ? 
        'Bot needs admin privileges' : 
        'Failed to process approvals'}*`);
    }
  } catch (error) {
    console.error('Command error:', error);
    m.reply('*⚠️ An error occurred while processing*');
  }
};

export default approveall;
