import config from '../../config.cjs';

const ping = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["ping", "speed", "p"].includes(cmd)) {
    const start = performance.now();
    await m.React('⚡'); // React with lightning icon

    // Speed effect emojis
    const effects = ['⚡', '🔥', '💥', '🚀', '🎯', '🔮', '🌀', '💎', '🌪️', '✨'];
    
    // Randomize effects
    const randomEffect = () => effects[Math.floor(Math.random() * effects.length)];

    // Initial animated message
    const msg = await sock.sendMessage(m.from, { 
      text: `*⚡ BOOSTING SPEED...* ${randomEffect()}`
    }, { quoted: m });

    const editMessage = async (newText) => {
      await sock.sendMessage(m.from, { 
        text: newText, 
        edit: msg.key 
      });
    };

    // ⚡ Animated speed boost sequence
    await new Promise(res => setTimeout(res, 600));
    await editMessage(`*🚀 SYSTEM OPTIMIZING...* ${randomEffect()}`);

    await new Promise(res => setTimeout(res, 600));
    await editMessage(`*💨 TURBOCHARGING SPEED...* ${randomEffect()}`);

    await new Promise(res => setTimeout(res, 600));
    await editMessage(`*🔮 ENHANCING PERFORMANCE...* ${randomEffect()}`);

    // Speed Calculation
    const end = performance.now();
    const responseTime = (end - start).toFixed(2);

    await new Promise(res => setTimeout(res, 600));
    await editMessage(`> *⚡ SARKAR-MD SPEED:* *${responseTime}ms* ${randomEffect()}`);

    await m.React('✅'); // Success reaction
  }
};

export default ping;
