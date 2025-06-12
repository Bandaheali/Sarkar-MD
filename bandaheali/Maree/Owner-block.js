import config from '../../config.js';

const block = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["block2"].includes(cmd)) {
    // Check if user is owner/creator
    const owner = config.OWNER_NUMBER;
    const bot = await sock.decodeJid(sock.user.id);
    const dev = "923253617422@s.whatsapp.net";
    const isCreator = [owner, bot, dev].includes(m.sender);
    
    if (!isCreator) {
      await m.reply("🚫 This command is only for my owner!");
      return;
    }

    try {
      let targetUser = null;

      // Check mentions first
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0];
      } 
      // Check quoted message - FIXED VERSION
      else if (m.quoted) {
        // Proper way to get quoted sender
        targetUser = m.quoted.participant || m.quoted.sender;
        
        // If it's a group message, we need to get the actual sender
        if (m.quoted.key.remoteJid.includes('@g.us')) {
          const quotedMsg = await sock.loadMessage(m.quoted.key.remoteJid, m.quoted.key.id);
          targetUser = quotedMsg.key.participant || quotedMsg.key.sender;
        }
      }
      // Check direct number input
      else {
        const args = m.body.slice(prefix.length).trim().split(' ');
        if (args.length > 1) {
          const potentialNumber = args[1].replace(/[^0-9]/g, '');
          if (potentialNumber.length >= 10) {
            targetUser = potentialNumber + '@s.whatsapp.net';
          }
        }
      }

      if (!targetUser) {
        return await m.reply(`*Usage:*\n- Mention a user (@user)\n- Reply to a user's message\n- Or provide a number: ${prefix}block 923001234567`);
      }

      // Validate and format JID
      targetUser = targetUser.includes('@') ? targetUser : targetUser + '@s.whatsapp.net';
      
      // Verify the user exists on WhatsApp
      const contact = await sock.onWhatsApp(targetUser);
      if (!contact || contact.length === 0) {
        return await m.reply("❌ User not found on WhatsApp");
      }

      // Block the user
      await sock.updateBlockStatus(targetUser, 'block');
      
      // Get the user's name
      const userName = contact[0]?.name || targetUser.split('@')[0];
      
      await m.reply(`✅ Successfully blocked ${userName} (${targetUser})`);
      
    } catch (error) {
      console.error("Block Error:", error);
      await m.reply(`⚠️ Failed to block user: ${error.message}`);
    }
  }
};

export default block;
