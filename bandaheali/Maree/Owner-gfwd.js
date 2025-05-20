import config from '../../config.js';

const groupForward = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  const dev = '923253617422@s.whatsapp.net';
  const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
  const bot = typeof sock.user.id === 'string' ? sock.user.id : sock.decodeJid(sock.user.id);
  const owners = [dev, owner, bot];

  const allowedCmds = ['gforward', 'gfwd', 'groupforward'];

  if (!allowedCmds.includes(cmd)) return;

  if (!owners.includes(m.sender)) return m.reply('Only the bot owner or developer can use this command.');
  if (!m.quoted) return m.reply('Reply to a message you want to forward.');
  
  const argsText = m.body.trim().split(/\s+/).slice(1).join(' ');
  if (!argsText) return m.reply('Provide one or more group JIDs separated by commas.');

  const jids = argsText.split(',').map(j => j.trim()).filter(Boolean);

  if (jids.length > 10) return m.reply('You can only forward to a maximum of 10 groups at once.');

  const invalids = jids.filter(jid => !jid.endsWith('@g.us'));

  if (invalids.length > 0) {
    return m.reply(`The following are *not group JIDs*:\n\n${invalids.join('\n')}\n\nThis command only supports group forwarding.\nFor users, use *.forward* instead.`);
  }

  try {
    for (const jid of jids) {
      await sock.sendMessage(jid, { forward: m.quoted }, { quoted: m });
    }
    m.reply(`✅ Message forwarded to ${jids.length} group(s) successfully.`);
  } catch (err) {
    m.reply('❌ Failed to forward to some or all groups.');
    console.error('Group Forward Error:', err);
  }
};

export default groupForward;
