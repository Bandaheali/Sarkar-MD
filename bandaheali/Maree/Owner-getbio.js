import config from '../../config.cjs';

const getbio = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'getbio') {
    try {
      const jid = m.body.split(' ')[1] || m.sender;
      const about = await sock.fetchStatus(jid);

      if (!about) {
        return sock.sendMessage(m.from, { text: 'No bio found.' });
      }

      await sock.sendMessage(m.from, { text: `User Bio:\n\n${about.status}` });
    } catch (error) {
      await sock.sendMessage(m.from, { text: 'No bio found.' });
    }
  }
};

export default getbio;
