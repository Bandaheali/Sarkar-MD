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
      // Get pending requests
      const pendingRequests = await gss.getGroupPendingInvites(m.from);
      
      if (!pendingRequests || pendingRequests.length === 0) {
        return m.reply('*ℹ No pending join requests found*');
      }

      // Approve all requests
      const approvePromises = pendingRequests.map(async request => {
        try {
          await gss.approveGroupJoinRequest(m.from, request.jid);
          return { success: true, jid: request.jid };
        } catch (e) {
          return { success: false, jid: request.jid, error: e.message };
        }
      });

      const results = await Promise.all(approvePromises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      // Send report
      let report = `*✅ Approved ${successful} requests*\n`;
      if (failed > 0) {
        report += `*❌ Failed to approve ${failed} requests*\n`;
        report += `Possible reasons:\n`;
        report += `- User already joined\n`;
        report += `- Privacy restrictions\n`;
        report += `- Invalid request\n`;
      }

      await m.reply(report);

      // Alternative detailed report
      if (failed > 0) {
        const failedList = results.filter(r => !r.success)
          .map(r => `• ${r.jid.split('@')[0]}: ${r.error}`)
          .join('\n');
        
        await gss.sendMessage(m.from, {
          text: `*Failed Approvals Details:*\n${failedList}`,
          mentions: [m.sender]
        }, { quoted: m });
      }

    } catch (error) {
      console.error('Approveall error:', error);
      if (error.message.includes('not authorized')) {
        await m.reply('*❌ Bot needs admin privileges to approve requests*');
      } else {
        await m.reply(`*❌ Error: ${error.message}*`);
      }
    }
  } catch (error) {
    console.error('Command error:', error);
    m.reply('*⚠️ An
