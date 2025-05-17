import config from '../../config.js';

const invite = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['aja', 'add'];

    if (!validCommands.includes(cmd)) return;
    if (!m.isGroup) return m.reply("*🚫 THIS COMMAND CAN ONLY BE USED IN GROUPS*");

    if (!text) return m.reply(`*📛 ENTER THE NUMBER YOU WANT TO ADD*\n\nExample:\n*${prefix + cmd}* 923253617422`);
    if (text.includes('+')) return m.reply(`*📛 ENTER NUMBER WITHOUT +*`);
    if (isNaN(text)) return m.reply(`*📛 ENTER ONLY NUMBERS WITH COUNTRY CODE*`);

    const botNumber = await gss.decodeJid(gss.user.id);
    const groupMetadata = await gss.groupMetadata(m.from);
    const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
    const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

    if (!isBotAdmin) return m.reply('*📛 BOT MUST BE ADMIN*');
    if (!senderAdmin) return m.reply('*📛 YOU MUST BE ADMIN*');

    const userJid = `${text}@s.whatsapp.net`;

    // First try direct add with multiple attempts
    let added = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await gss.groupParticipantsUpdate(m.from, [userJid], 'add');
        
        // Wait and verify
        await new Promise(resolve => setTimeout(resolve, 3000));
        const updatedGroup = await gss.groupMetadata(m.from);
        if (updatedGroup.participants.some(p => p.id === userJid)) {
          added = true;
          return m.reply(`*✅ USER ADDED SUCCESSFULLY*`);
        }
      } catch (error) {
        console.log(`Add attempt ${attempt} failed:`, error.message);
        if (attempt === 3) {
          await m.reply(`*⚠ Failed to add user directly. Trying alternative method...*`);
        }
      }
    }

    // Alternative method - invite via link
    try {
      const inviteLink = 'https://chat.whatsapp.com/' + await gss.groupInviteCode(m.from);
      await gss.sendMessage(userJid, {
        text: `*GROUP INVITATION*\n\nYou've been invited to join "${groupMetadata.subject}"\n\nLink: ${inviteLink}\n\nInvited by: @${m.sender.split('@')[0]}`,
        mentions: [m.sender]
      });
      return m.reply(`*📩 INVITE LINK SENT TO USER*`);
    } catch (error) {
      console.error('Invite sending failed:', error);
      return m.reply(`*❌ FAILED TO ADD USER. THEY MAY HAVE PRIVACY RESTRICTIONS.*`);
    }
  } catch (error) {
    console.error('Error:', error);
    m.reply('*❌ AN ERROR OCCURRED*');
  }
};

export default invite;
