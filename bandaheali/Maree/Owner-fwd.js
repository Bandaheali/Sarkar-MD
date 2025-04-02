import config from '../../config.cjs';

const forward = async (m, sock) => { const prefix = config.PREFIX; const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

if (["forward", "fwd"].includes(cmd)) { if (!m.quoted) return m.reply('Reply to a message to forward.');

const args = m.body.split(' ').slice(1);
if (args.length === 0) return m.reply('Provide a JID (group/number) to forward to.');

const targetJid = args[0].includes('@') ? args[0] : `${args[0]}@s.whatsapp.net`;

try {
  await sock.sendMessage(targetJid, { forward: m.quoted }, { quoted: m });
  m.reply('Message forwarded successfully!');
} catch (error) {
  m.reply('Failed to forward message.');
  console.error(error);
}

} };

export default forward;

