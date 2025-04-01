const adminChange = async (m, sock) => {
  const prefix = config.PREFIX;
  
  // Detect admin changes
  if (m.message?.protocolMessage?.key?.participant && 
      (m.message.protocolMessage.type === 14 || m.message.protocolMessage.type === 11)) {
    
    try {
      const groupMetadata = await sock.groupMetadata(m.from);
      const participants = m.message.protocolMessage.participant.split('@')[0];
      const actionUser = m.message.protocolMessage.key.participant.split('@')[0];
      
      // Get user names
      const targetUser = participants.split('@')[0];
      const actorUser = actionUser.split('@')[0];
      
      // Check if promotion or demotion
      const isPromotion = m.message.protocolMessage.type === 11;
      
      // Get current admin list
      const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id.split('@')[0]);
      
      // Verify if the change actually happened
      const wasSuccessful = isPromotion ? 
        admins.includes(targetUser) : 
        !admins.includes(targetUser);
      
      if (wasSuccessful) {
        const actionText = isPromotion ? 
          `🌟 *ADMIN PROMOTION* 🌟\n\n@${actorUser} has promoted @${targetUser} to Admin!` :
          `⚠️ *ADMIN DEMOTION* ⚠️\n\n@${actorUser} has removed @${targetUser} from Admin!`;
        
        await sock.sendMessage(
          m.from,
          {
            text: actionText,
            mentions: [`${targetUser}@s.whatsapp.net`, `${actorUser}@s.whatsapp.net`]
          },
          { quoted: m }
        );
      }
    } catch (error) {
      console.error("Error in admin change detection:", error);
    }
  }
};

export default adminChange;
