import config from '../../config.js';

const block = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["block"].includes(cmd)) {
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
      // Check quoted message
      else if (m.quoted) {
        targetUser = m.quoted.sender || m.quoted.participant;
        
        // For group messages, use participant if available
        if (m.quoted.key?.remoteJid?.includes('@g.us')) {
          targetUser = m.quoted.participant || m.quoted.sender;
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
      
      // Protection against blocking self/owner/dev
      const protectedUsers = [
        owner.includes('@') ? owner : owner + '@s.whatsapp.net',
        bot,
        dev
      ];
      
      if (protectedUsers.includes(targetUser)) {
        return await m.reply("❌ I can't block myself or my owner/dev!");
      }

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
