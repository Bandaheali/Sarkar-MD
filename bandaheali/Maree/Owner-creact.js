import config from '../../config.js';

const stylizedChars = {
  a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
  h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
  o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
  v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
  '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
  '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
};

const chr = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["chr", "creact"].includes(cmd)) {
    const bot = sock.decodeJid(sock.user.id);
    const dev = "923253617422@s.whatsapp.net";
    const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
    const isCreator = [bot, dev, owner].includes(m.sender);

    if (!isCreator) return m.reply("❌ Owner only command");

    const args = m.body.trim().split(' ').slice(1);
    if (args.length < 2) {
      return m.reply(`Usage:\n${prefix}chr https://whatsapp.com/channel/1234567890 your_text_here`);
    }

    const [link, ...textParts] = args;
    const inputText = textParts.join(' ').toLowerCase();

    if (!link.includes("whatsapp.com/channel/")) {
      return m.reply("❌ Invalid channel link format.");
    }

    const channelId = link.split('/')[4];
    const messageId = link.split('/')[5]?.split('?')[0];
    if (!channelId || !messageId) {
      return m.reply("❌ Invalid link - missing channel ID or message ID.");
    }

    const stylized = inputText
      .split('')
      .map(char => (char === ' ' ? '―' : stylizedChars[char] || char))
      .join('');

    await m.React('🔤');

    try {
      // First get the channel JID
      const channelJid = `${channelId}@newsletter`;
      
      // Send the reaction directly
      await sock.sendMessage(channelJid, {
        react: {
          text: stylized,
          key: {
            id: messageId,
            remoteJid: channelJid,
            fromMe: false
          }
        }
      });

      await sock.sendMessage(
        m.from,
        {
          text:
`╭━━━〔 *KHAN-MD* 〕━━━┈⊷
┃▸ *Success!* Reaction sent
┃▸ *Channel ID:* ${channelId}
┃▸ *Message ID:* ${messageId}
┃▸ *Reaction:* ${stylized}
╰────────────────┈⊷
> *© Pᴏᴡᴇʀᴇᴅ Bʏ KʜᴀɴX-Aɪ ♡*`
        },
        { quoted: m }
      );

      await m.React('✅');
    } catch (err) {
      console.error(err);
      await m.React('❌');
      return m.reply(`❎ Error: ${err.message || "Failed to send reaction"}`);
    }
  }
};

export default chr;
