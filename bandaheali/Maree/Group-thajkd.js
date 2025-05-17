import config from '../../config.js';

const GroupCmds = async (m, gss) => { try { const botNumber = await gss.decodeJid(gss.user.id); const prefix = config.PREFIX;

if (!m.body.startsWith(prefix)) return;

const args = m.body.slice(prefix.length).trim().split(/\s+/);
const cmd = args.shift().toLowerCase();
const text = args.join(' ');

const validCommands = ['tagall', 'hidetag', 'open', 'close', 'disappearingmsg', 'kick', 'invite'];
if (!validCommands.includes(cmd)) return;

const groupMetadata = m.isGroup ? await gss.groupMetadata(m.from) : null;
const participants = groupMetadata?.participants || [];
const botAdmin = participants.find(p => p.id === botNumber)?.admin;
const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

if (m.isGroup && (!botAdmin || !senderAdmin)) {
  if (!botAdmin) return m.reply("*\uD83D\uDC9B BOT MUST BE AN ADMIN TO USE THIS COMMAND*");
  if (!senderAdmin) return m.reply("*\uD83D\uDC9B YOU MUST BE AN ADMIN TO USE THIS COMMAND*");
}

if (cmd === 'tagall') {
  const quotedMsg = m.quoted ? m.quoted.message : null;
  let message = `\uD83D\uDCE2 *Attention Everyone!* \uD83D\uDCE2\n\n`;
  if (quotedMsg) {
    message += `✉️ *Replied Message:*\n`;
    const type = Object.keys(quotedMsg)[0];
    message += `_${type}_ message attached.\n\n`;
  } else {
    message += `\uD83D\uDD39 *Message:* ${text || '⚠️ No message provided ⚠️'}\n\n`;
  }
  for (let participant of participants) {
    message += `❒ @${participant.id.split('@')[0]}\n`;
  }
  await gss.sendMessage(m.from, { text: message, mentions: participants.map(a => a.id) }, { quoted: m });
}

else if (cmd === 'hidetag') {
  const mentions = participants.map(a => a.id);
  if (m.quoted) {
    const quotedMsg = m.quoted.message;
    const type = Object.keys(quotedMsg)[0];
    await gss.sendMessage(m.from, { [type]: quotedMsg[type], mentions }, { quoted: m });
  } else {
    let message = `\uD83D\uDCE2 *${text || '⚠️ No message provided ⚠️'}*`;
    await gss.sendMessage(m.from, { text: message, mentions }, { quoted: m });
  }
}

else if (cmd === 'open') {
  await gss.groupSettingUpdate(m.from, 'not_announcement');
  await m.reply("✅ *Group is now open! Everyone can send messages.*");
}

else if (cmd === 'close') {
  await gss.groupSettingUpdate(m.from, 'announcement');
  await m.reply("\uD83D\uDD12 *Group is now closed! Only admins can send messages.*");
}

else if (cmd === 'disappearingmsg') {
  let duration;
  if (args[0] === '24h') duration = 86400;
  else if (args[0] === '7d') duration = 604800;
  else if (args[0] === '90d') duration = 7776000;
  else if (args[0] === 'off') duration = 0;
  else return await m.reply("⚠️ *Invalid duration! Use:* \n\n- `24h` (1 day)\n- `7d` (1 week)\n- `90d` (90 days)\n- `off` (Disable)");

  try {
    await gss.sendMessage(m.from, { disappearingMessagesInChat: duration });
    await m.reply(duration === 0 ? "\uD83D\uDED1 *Disappearing messages have been turned OFF!*" : `✅ *Disappearing messages enabled for ${args[0]}!*`);
  } catch {
    await m.reply('❌ *Failed to update disappearing messages!*');
  }
}

else if (cmd === 'kick') {
  let target;
  if (m.quoted) {
    target = m.quoted.sender;
  } else if (args[0]) {
    target = args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  }

  if (!target || !participants.find(p => p.id === target)) {
    return await m.reply("⚠️ *User is not in this group or invalid!*");
  }

  try {
    await gss.groupParticipantsUpdate(m.from, [target], 'remove');
    await m.reply(`✅ *@${target.split('@')[0]} has been removed!*`, { mentions: [target] });
  } catch (error) {
    await m.reply("❌ *Failed to remove the user!*");
  }
}

//else if (cmd === 'add') {
//  if (args.length === 0) return await m.reply("⚠️ *Please provide a phone number!*");
//
//  let target = args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net";

//  if (participants.find(p => p.id === target)) {
 //   return await m.reply("⚠️ *User is already in this group!*");
//  }
//
//  try {
//    await gss.groupParticipantsUpdate(m.from, [target], 'add');
//    await m.reply(`✅ *@${target.split('@')[0]} has been added to the group!*`, { mentions: [target] });
//  } catch (error) {
//    await m.reply("❌ *Failed to add the user! Make sure the number is correct and can be added to the group.*");
//  }
//}

else if (cmd === 'invite') {
  let target;
  if (m.quoted) {
    target = m.quoted.sender;
  } else if (args[0]) {
    target = args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  }

  try {
    const inviteCode = await gss.groupInviteCode(m.from);
    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

    const isUserInContacts = await gss.onWhatsApp(target);
    if (!isUserInContacts.length) {
      return await m.reply("⚠️ *User not found on WhatsApp or privacy settings prevent inviting!*");
    }

    await gss.sendMessage(target, { text: `\uD83D\uDCE9 *You have been invited to join the group!*\n\n\uD83D\uDD17 ${inviteLink}` });
    await m.reply(`✅ *Invite link sent to @${target.split('@')[0]}!*`, { mentions: [target] });

  } catch (error) {
    await m.reply("❌ *Failed to send invite link! Make sure the bot is an admin and the user can receive invites.*");
  }
}

} catch (error) { console.error('Error:', error); await m.reply('❌ An error occurred while processing the command.'); } };

export default GroupCmds;

