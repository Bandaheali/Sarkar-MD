import config from '../../config.cjs';

const invite = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['invite', 'add'];

    if (!validCommands.includes(cmd)) return;
    if (!m.isGroup) return m.reply("*_🚫 THIS COMMAND CAN ONLY BE USED IN GROUPS_*");

    if (!text) return m.reply(`*_📛 ENTER THE NUMBER YOU WANT TO INVITE TO THE GROUP_*\n\nExample:\n*${prefix + cmd}* 923253617422`);
    if (text.includes('+')) return m.reply(`*_📛 ENTER THE NUMBER WITHOUT_* *+* `);
    if (isNaN(text)) return m.reply(`*_📛 ENTER ONLY THE NUMBERS PLUS YOUR COUNTRY CODE WITHOUT SPACES_*`);

    const botNumber = await gss.decodeJid(gss.user.id);
    const groupMetadata = await gss.groupMetadata(m.from);
    const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
    const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

    if (!isBotAdmin) return m.reply('*_📛 BOT MUST BE AN ADMIN TO USE THIS COMMAND_*');
    if (!senderAdmin) return m.reply('*_📛 YOU MUST BE AN ADMIN TO USE THIS COMMAND_*');

    const userJid = `${text}@s.whatsapp.net`;

    try {
      // First try to add directly
      await gss.groupParticipantsUpdate(m.from, [userJid], 'add');
      
      // Verify if user was actually added
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      const updatedGroupData = await gss.groupMetadata(m.from);
      const isUserAdded = updatedGroupData.participants.some(p => p.id === userJid);
      
      if (isUserAdded) {
        return m.reply(`*_☑ USER HAS BEEN SUCCESSFULLY ADDED TO THE GROUP_*`);
      } else {
        throw new Error('User not added');
      }
    } catch (error) {
      console.warn('Direct add failed, sending invite link instead:', error.message);
      
      try {
        const inviteLink = 'https://chat.whatsapp.com/' + await gss.groupInviteCode(m.from);
        const inviteMessage = `≡ *_GROUP INVITATION_*\n\nA USER INVITES YOU TO JOIN THE GROUP "${groupMetadata.subject}".\n\nInvite Link: ${inviteLink}\n\nINVITED BY: @${m.sender.split('@')[0]}`;

        await gss.sendMessage(userJid, { text: inviteMessage, mentions: [m.sender] });
        return m.reply(`*_☑ COULD NOT ADD DIRECTLY, AN INVITE LINK HAS BEEN SENT TO THE USER_*`);
      } catch (inviteError) {
        console.error('Invite sending failed:', inviteError);
        return m.reply('*_❌ FAILED TO ADD USER AND COULD NOT SEND INVITE LINK. USER MAY HAVE PRIVACY RESTRICTIONS._*');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    m.reply('*_An error occurred while processing the command._*');
  }
};

export default invite;
