import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const forward = async (m, sock) => {
    const prefix = config.PREFIX;
  const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
  const bot = sock.decodeJid(sock.user.id);
  const dev = '923253617422@s.whatsapp.net';
  isCreater = [dev, owner, bot].includes(m.sender);
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    if (!["forward", "fwd"].includes(cmd)) return;
if(!isCreater) return;
    try {
        if (!m.quoted) {
            await sendNewsletter(
                sock,
                m.from,
                "Reply to a message to forward!",
                m,
                "🚫 Forward Error",
                "Missing quoted message"
            );
            return;
        }

        const args = m.body.split(' ').slice(1);
        if (!args[0]) {
            await sendNewsletter(
                sock,
                m.from,
                "Usage: !forward [jid]",
                m,
                "ℹ️ Forward Help",
                "Missing destination"
            );
            return;
        }

        const targetJid = args[0].includes('@') ? args[0] : args[0] + '@s.whatsapp.net';
        
        // Normal forwarding (no newsletter style)
        await sock.sendMessage(targetJid, { forward: m.quoted });

        // Success message (newsletter style)
        await sendNewsletter(
            sock,
            m.from,
            `Message forwarded to ${targetJid}`,
            m,
            "✅ Forward Success",
            "Message delivered"
        );

    } catch (error) {
        await sendNewsletter(
            sock,
            m.from,
            `Failed: ${error.message}`,
            m,
            "🚫 Forward Error",
            "Delivery failed"
        );
    }
};

export default forward;












/*import config from '../../config.js';

const forward = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
const bot = sock.decodeJid(sock.user.id);
  const dev = '923253617422@s.whatsapp.net';
  const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
  const owners = [dev, bot, owner];
  if (["forward", "fwd"].includes(cmd)) {
    if (!owners.includes(m.sender)) return m.reply('Only the bot owner or developer can use this command.');

    if (!m.quoted) return m.reply('Reply to a message to forward.');

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
  }
};

export default forward;
*/
