import config from '../../config.js';

const resetlink = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    if (cmd !== 'resetlink') return;
    if (!m.isGroup) return m.reply("*🚫 This command only works in groups*");

    const botNumber = await gss.decodeJid(gss.user.id);
    const groupMetadata = await gss.groupMetadata(m.from);
    const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
    const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

    if (!isBotAdmin) return m.reply('*📛 Bot must be admin to reset link*');
    if (!senderAdmin) return m.reply('*📛 You must be admin to use this command*');

    try {
      // Revoke old link
      await gss.groupRevokeInvite(m.from);
      
      // Get new link
      const newLink = 'https://chat.whatsapp.com/' + await gss.groupInviteCode(m.from);
      
      // Send confirmation with new link
      await m.reply(`*🔗 Group link reset successfully!*\n\nNew Invite Link:\n${newLink}`);
      
      // Alternative - send as button
      await gss.sendMessage(m.from, {
        text: 'New Group Invite Link',
        templateButtons: [{
          urlButton: {
            displayText: 'Click to Join',
            url: newLink
          }
        }]
      });
      
    } catch (error) {
      console.error('Reset link error:', error);
      if (error.message.includes('not authorized')) {
        await m.reply('*❌ Bot needs admin privileges to reset link*');
      } else {
        await m.reply('*❌ Failed to reset group link*');
      }
    }
  } catch (error) {
    console.error('Command error:', error);
    m.reply('*⚠️ An error occurred while processing*');
  }
};

export default resetlink;
