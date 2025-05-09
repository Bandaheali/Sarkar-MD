import axios from "axios";
import config from '../../config.cjs';

const tempmail = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body.toLowerCase();
  
  // Create temp email
  if (body.startsWith(`${prefix}tempmail`)) {
    await m.React('⏳');
    try {
      const domains = ['1secmail.com', '1secmail.net', '1secmail.org'];
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const randomName = Math.random().toString(36).substring(2, 10);
      const email = `${randomName}@${randomDomain}`;

      await sock.sendMessage(
        m.from,
        {
          text: `📧 *Temporary Email Created*\n\nEmail: ${email}\n\nUse *${prefix}checkinbox ${randomName} ${randomDomain}* to check messages\n\n⚠️ Expires after 1 hour`,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: "TempMail Created",
              body: "Powered by 1secmail",
              thumbnailUrl: 'https://i.imgur.com/6Qf9Z3A.png'
            }
          }
        },
        { quoted: m }
      );
      await m.React('✅');
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.from, { text: '*❌ Failed to generate tempmail*' }, { quoted: m });
      await m.React('❌');
    }
  }

  // Check inbox
  if (body.startsWith(`${prefix}checkinbox`)) {
    await m.React('⏳');
    try {
      const args = body.split(' ');
      if (args.length < 3) {
        return await sock.sendMessage(m.from, { text: `❌ *Usage:* ${prefix}checkinbox username domain\nExample: ${prefix}checkinbox abc123 1secmail.com` }, { quoted: m });
      }

      const [username, domain] = args.slice(1);
      
      // Get message list
      const { data: messages } = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`);
      
      if (!messages || messages.length === 0) {
        return await sock.sendMessage(m.from, { text: '📭 *No messages found in inbox*' }, { quoted: m });
      }

      // Get full message content
      let inboxText = `📬 *Inbox for ${username}@${domain}*\n\n`;
      for (const msg of messages.slice(0, 5)) { // Show max 5 messages
        const { data: fullMsg } = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${msg.id}`);
        
        inboxText += `📌 *From:* ${fullMsg.from}\n`;
        inboxText += `📝 *Subject:* ${fullMsg.subject || 'No Subject'}\n`;
        inboxText += `⏰ *Date:* ${new Date(fullMsg.date).toLocaleString()}\n`;
        inboxText += `────────────────\n`;
      }

      await sock.sendMessage(
        m.from,
        { 
          text: inboxText,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: "TempMail Inbox",
              body: `Showing ${Math.min(messages.length, 5)} messages`,
              thumbnailUrl: 'https://i.imgur.com/6Qf9Z3A.png'
            }
          }
        },
        { quoted: m }
      );
      await m.React('✅');
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.from, { text: '*❌ Failed to check inbox*' }, { quoted: m });
      await m.React('❌');
    }
  }
};

export default tempmail;
