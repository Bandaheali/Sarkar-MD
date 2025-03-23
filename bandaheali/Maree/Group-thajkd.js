import config from '../../config.cjs';

const GroupCmds = async (m, gss) => {
  try {
    const ownerNumber = config.OWNER_NUMBER.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;

    if (!m.body.startsWith(prefix)) return;

    const args = m.body.slice(prefix.length).trim().split(/\s+/);
    const cmd = args.shift().toLowerCase();
    const text = args.join(' ');

    const validCommands = ['tagall', 'hidetag', 'open', 'close', 'dis', 'kick', 'add', 'invite'];
    if (!validCommands.includes(cmd)) return;

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;
    const botAdmin = participants.find(p => p.id === botNumber)?.admin;
    const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

    if (!botAdmin) return m.reply("*📛 BOT MUST BE AN ADMIN TO USE THIS COMMAND*");
    if (!senderAdmin) return m.reply("*📛 YOU MUST BE AN ADMIN TO USE THIS COMMAND*");

    switch (cmd) {
      case 'tagall':
        let message = `📢 *Attention Everyone!* 📢\n\n🔹 *Message:* ${text || '⚠️ No message provided ⚠️'}\n\n`;
        for (let participant of participants) {
          message += `❒ @${participant.id.split('@')[0]}\n`;
        }
        await gss.sendMessage(m.from, { text: message, mentions: participants.map(a => a.id) }, { quoted: m });
        break;

      case 'hidetag':
        await gss.sendMessage(m.from, { text: `📢 *${text || '⚠️ No message provided ⚠️'}*`, mentions: participants.map(a => a.id) }, { quoted: m });
        break;

      case 'open':
        await gss.groupSettingUpdate(m.from, 'not_announcement');
        await m.reply("✅ *Group is now open! Everyone can send messages.*");
        break;

      case 'close':
        await gss.groupSettingUpdate(m.from, 'announcement');
        await m.reply("🔒 *Group is now closed! Only admins can send messages.*");
        break;

      case 'dis':
        let duration = { '24h': 86400, '7d': 604800, '90d': 7776000, 'off': 0 }[args[0]];
        if (duration === undefined) {
          return await m.reply("⚠️ *Invalid duration! Use:* \n\n- `24h` (1 day)\n- `7d` (1 week)\n- `90d` (90 days)\n- `off` (Disable)");
        }
        try {
          await gss.sendMessage(m.from, { disappearingMessagesInChat: duration });
          await m.reply(duration === 0 ? "🛑 *Disappearing messages have been turned OFF!*" : `✅ *Disappearing messages enabled for ${args[0]}!*`);
        } catch {
          await m.reply('❌ *Failed to update disappearing messages!*');
        }
        break;

      case 'kick':
        if (args.length === 0 && !m.quoted) return await m.reply("⚠️ *Please mention a user or provide a number!*");

        let targetKick = m.quoted ? m.quoted.sender : args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net";

        if (targetKick === botNumber) return await m.reply("⚠️ *I can't kick myself!*");
        if (targetKick === ownerNumber) return await m.reply("⚠️ *I can't kick my owner!*");
        if (!participants.find(p => p.id === targetKick)) return await m.reply("⚠️ *User is not in this group!*");

        try {
          await gss.groupParticipantsUpdate(m.from, [targetKick], 'remove');
          await m.reply(`✅ *@${targetKick.split('@')[0]} has been removed!*`, { mentions: [targetKick] });
        } catch {
          await m.reply("❌ *Failed to remove the user!*");
        }
        break;

      case 'add':
        if (args.length === 0) return await m.reply("⚠️ *Please provide a phone number!*");

        let targetAdd = args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net";
        if (participants.find(p => p.id === targetAdd)) return await m.reply("⚠️ *User is already in this group!*");

        try {
          await gss.groupParticipantsUpdate(m.from, [targetAdd], 'add');
          await m.reply(`✅ *@${targetAdd.split('@')[0]} has been added to the group!*`, { mentions: [targetAdd] });
        } catch {
          await m.reply("❌ *Failed to add the user! Make sure the number is correct and can be added to the group.*");
        }
        break;

      case 'invite':
        if (args.length === 0 && !m.quoted) return await m.reply("⚠️ *Please mention a user or provide a number!*");

        let targetInvite = m.quoted ? m.quoted.sender : args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net";

        try {
          const inviteCode = await gss.groupInviteCode(m.from);
          const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

          const isUserInContacts = await gss.onWhatsApp(targetInvite);
          if (!isUserInContacts.length) {
            return await m.reply("⚠️ *User not found on WhatsApp or privacy settings prevent inviting!*");
          }

          await gss.sendMessage(targetInvite, { text: `📩 *You have been invited to join the group!*\n\n🔗 ${inviteLink}` });
          await m.reply(`✅ *Invite link sent to @${targetInvite.split('@')[0]}!*`, { mentions: [targetInvite] });

        } catch {
          await m.reply("❌ *Failed to send invite link! Make sure the bot is an admin and the user can receive invites.*");
        }
        break;

      default:
        return;
    }

  } catch (error) {
    console.error('Error:', error);
    await m.reply('❌ *An error occurred while processing the command.*');
  }
};

export default GroupCmds;
