import axios from "axios";
import config from '../../config.cjs';

// Store emails in memory (for simplicity)
const tempEmails = new Map();

const tempmail = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body.toLowerCase().trim();

  // Create temp email
  if (body === `${prefix}tempmail`) {
    await m.React('⏳');
    try {
      const domains = ['1secmail.com', '1secmail.net', '1secmail.org'];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const username = Math.random().toString(36).substring(2, 10);
      const email = `${username}@${domain}`;
      
      // Store in memory
      tempEmails.set(m.sender, { username, domain });
      
      await sock.sendMessage(
        m.from,
        {
          text: `📧 *Your Temp Email*\n\n${email}\n\nSimply type *${prefix}inbox* to check messages\n\n⚠️ Expires after 1 hour`,
          buttons: [
            { buttonId: `${prefix}inbox`, buttonText: { displayText: 'Check Inbox' }, type: 1 }
          ],
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: "TempMail Ready",
              body: "Click button to check inbox",
              thumbnailUrl: 'https://i.imgur.com/6Qf9Z3A.png'
            }
          }
        },
        { quoted: m }
      );
      await m.React('✅');
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.from, { text: '*❌ Email creation failed*' }, { quoted: m });
      await m.React('❌');
    }
  }

  // Check inbox (automatic - no need to remember email)
  if (body === `${prefix}inbox`) {
    await m.React('⏳');
    try {
      const userEmail = tempEmails.get(m.sender);
      if (!userEmail) {
        return await sock.sendMessage(m.from, { 
          text: `❌ No temp email found\n\nCreate one with *${prefix}tempmail* first` 
        }, { quoted: m });
      }

      const { username, domain } = userEmail;
      const { data: messages } = await axios.get(
        `https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`
      );

      if (!messages?.length) {
        return await sock.sendMessage(m.from, { 
          text: `📭 *Inbox Empty*\n\n${username}@${domain}\n\nNo messages received yet` 
        }, { quoted: m });
      }

      // Show only the latest message for simplicity
      const latest = messages[0];
      const { data: fullMsg } = await axios.get(
        `https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${latest.id}`
      );

      let msgText = `📬 *Latest Message*\n\n`;
      msgText += `✉️ *To:* ${username}@${domain}\n`;
      msgText += `📩 *From:* ${fullMsg.from}\n`;
      msgText += `📌 *Subject:* ${fullMsg.subject || 'No Subject'}\n\n`;
      msgText += `💬 *Message:*\n${fullMsg.textBody || fullMsg.htmlBody.substring(0, 200)}...\n\n`;
      msgText += `⏰ Received: ${new Date(fullMsg.date).toLocaleString()}`;

      await sock.sendMessage(
        m.from,
        { 
          text: msgText,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: `1 New Message`,
              body: `From: ${fullMsg.from}`,
              thumbnailUrl: 'https://i.imgur.com/6Qf9Z3A.png'
            }
          }
        },
        { quoted: m }
      );
      await m.React('✅');
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.from, { text: '*❌ Inbox check failed*' }, { quoted: m });
      await m.React('❌');
    }
  }
};

export default tempmail;
