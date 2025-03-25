import config from '../../config.cjs';

const ping = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["ping", "speed", "p"].includes(cmd)) {
    const start = performance.now();
    await m.React('⚡'); // React with lightning icon

    const end = performance.now();
    const responseTime = (end - start).toFixed(2);

    await sock.sendMessage(m.from, { 
      text: `*SARKAR-MD SPEED:* *${responseTime}ms*`
    }, { quoted: m });

    await m.React('✅'); // Success reaction
  }
};

export default ping;
