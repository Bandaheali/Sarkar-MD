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
      tempEmails.set(m.sender, { username, domain, email });
      
      await sock.sendMessage(
        m.from,
        {
          text: `📧 *Your Temp Email*\n\n${email}\n\nCheck messages with:\n*${prefix}inbox* (for your email)\n*${prefix}inbox email@domain.com* (for any email)\n\n⚠️ Expires after 1 hour`,
          buttons: [
            { buttonId: `${prefix}inbox`, buttonText: { displayText: 'Check My Inbox' }, type: 1 }
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

  // Check inbox (works for both stored emails and manually specified ones)
  if (body.startsWith(`${prefix}inbox`)) {
    await m.React('⏳');
    try {
      let username, domain;
      
      // Check if email is provided manually
      if (body.includes(' ')) {
        const email = body.split(' ')[1].trim();
        if (!email.includes('@')) {
          return await sock.sendMessage(m.from, { 
            text: `❌ Invalid email format\n\nUse: *${prefix}inbox username@domain.com*` 
          }, { quoted: m });
        }
        [username, domain] = email.split('@');
      } 
      // Otherwise use stored email
      else {
        const userEmail = tempEmails.get(m.sender);
        if (!userEmail) {
          return await sock.sendMessage(m.from, { 
            text: `❌ No temp email found\n\nCreate one with *${prefix}tempmail* first or specify email like:\n*${prefix}inbox username@domain.com*` 
          }, { quoted: m });
        }
        username = userEmail.username;
        domain = userEmail.domain;
      }

      const { data: messages } = await axios.get(
        `https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`
      );

      if (!messages?.length) {
        return await sock.sendMessage(m.from, { 
          text: `📭 *Inbox Empty*\n\n${username}@${domain}\n\nNo messages received yet` 
        }, { quoted: m });
      }

      // Show all messages (up to 5)
      let msgText = `📬 *Inbox for ${username}@${domain}*\n\n`;
      
      for (const [index, message] of messages.slice(0, 5).entries()) {
        const { data: fullMsg } = await axios.get(
          `https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${message.id}`
        );
        
        msgText += `📌 *Message ${index + 1}:*\n`;
        msgText += `From: ${fullMsg.from}\n`;
        msgText += `Subject: ${fullMsg.subject || 'No Subject'}\n`;
        msgText += `Date: ${new Date(fullMsg.date).toLocaleString()}\n\n`;
      }
      
      if (messages.length > 5) {
        msgText += `ℹ️ Showing 5 of ${messages.length} messages\n`;
      }
      
      msgText += `\nTo view a specific message, reply with:\n*${prefix}view ${username}@${domain} message_number*`;

      await sock.sendMessage(
        m.from,
        { 
          text: msgText,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: `${messages.length} New Messages`,
              body: `Inbox: ${username}@${domain}`,
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
  
  // View specific message
  if (body.startsWith(`${prefix}view`)) {
    await m.React('⏳');
    try {
      const parts = body.split(' ');
      if (parts.length < 3) {
        return await sock.sendMessage(m.from, { 
          text: `❌ Invalid format\n\nUse: *${prefix}view email@domain.com message_number*` 
        }, { quoted: m });
      }
      
      const email = parts[1];
      const messageNum = parseInt(parts[2]);
      
      if (!email.includes('@') || isNaN(messageNum)) {
        return await sock.sendMessage(m.from, { 
          text: `❌ Invalid format\n\nUse: *${prefix}view email@domain.com message_number*` 
        }, { quoted: m });
      }
      
      const [username, domain] = email.split('@');
      
      // Get message list first
      const { data: messages } = await axios.get(
        `https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`
      );
      
      if (!messages?.length || messageNum < 1 || messageNum > messages.length) {
        return await sock.sendMessage(m.from, { 
          text: `❌ Invalid message number\n\nThere are ${messages?.length || 0} messages in this inbox` 
        }, { quoted: m });
      }
      
      const messageId = messages[messageNum - 1].id;
      const { data: fullMsg } = await axios.get(
        `https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${messageId}`
      );
      
      let msgText = `✉️ *Message ${messageNum} from ${fullMsg.from}*\n\n`;
      msgText += `📩 *To:* ${username}@${domain}\n`;
      msgText += `📅 *Date:* ${new Date(fullMsg.date).toLocaleString()}\n`;
      msgText += `📌 *Subject:* ${fullMsg.subject || 'No Subject'}\n\n`;
      msgText += `📝 *Message Body:*\n${fullMsg.textBody || fullMsg.htmlBody.substring(0, 1000)}`;
      
      await sock.sendMessage(
        m.from,
        { 
          text: msgText,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: `Message from ${fullMsg.from}`,
              body: `Subject: ${fullMsg.subject || 'No Subject'}`,
              thumbnailUrl: 'https://i.imgur.com/6Qf9Z3A.png'
            }
          }
        },
        { quoted: m }
      );
      await m.React('✅');
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.from, { text: '*❌ Failed to view message*' }, { quoted: m });
      await m.React('❌');
    }
  }
};

export default tempmail;
