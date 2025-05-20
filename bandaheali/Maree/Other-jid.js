import config from '../../config.js';
import { sendFancyReply } from '../Sarkar/sendFancyReply.js'; // Make sure this path is correct

const jid = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  const dev = '923253617422@s.whatsapp.net';
  const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
  const bot = typeof sock.user.id === 'string' ? sock.user.id : sock.decodeJid(sock.user.id);
  const owners = [dev, owner, bot];

  if (cmd !== 'jid') return;
  const targetJid = m.quoted ? m.quoted.sender : m.chat;
  const isGroup = targetJid.endsWith('@g.us');

  const response = `*JID Info:*
${isGroup ? 'Group JID' : 'User JID'}: \n\`\`\`${targetJid}\`\`\``;

  await sendFancyReply(sock, m, response);
};

export default jid;
