import config from '../../config.js';

const blocklist = async (m, sock) => {
  const prefix = config.PREFIX;
  const Owner = config.OWNER_NUMBER;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'blocklist') {
    if (!Owner) {
      return sock.sendMessage(m.from, { text: '*📛 You are not the owner!*' });
    }

    try {
      const blockedUsers = await sock.fetchBlocklist();

      if (blockedUsers.length === 0) {
        return sock.sendMessage(m.from, { text: '📋 Your block list is empty.' });
      }

      const list = blockedUsers.map((user) => `🚧 BLOCKED ${user.split('@')[0]}`).join('\n');
      const count = blockedUsers.length;

      await sock.sendMessage(m.from, { text: `📋 Blocked Users (${count}):\n\n${list}` });
    } catch (err) {
      await sock.sendMessage(m.from, { text: `❌ Failed to fetch block list: ${err.message}` });
    }
  }
};

export default blocklist;
