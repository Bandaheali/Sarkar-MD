import axios from "axios";
import config from '../../config.cjs';

// Store emails in memory with expiration
const tempEmails = new Map();

const tempmail = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body.toLowerCase().trim();

  // Helper function to validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Create temp email
  if (body === `${prefix}tempmail`) {
    await m.React('⏳');
    try {
      const domains = ['1secmail.com', '1secmail.net', '1secmail.org'];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const username = Math.random().toString(36).substring(2, 10);
      const email = `${username}@${domain}`;
      
      // Store in memory with expiration (1 hour)
      tempEmails.set(m.sender, { 
        username, 
        domain, 
        email,
        createdAt: Date.now()
      });
      
      await sock.sendMessage(
        m.from,
        {
          text: `📧 *Your Temp Email*\n\n${email}\n\nCheck messages with:\n*${prefix}inbox* (for your email)\n*${prefix}inbox email@domain.com* (for any email)\n\n⚠️ Expires after 1 hour`,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: "TempMail Ready",
              body: "Use commands to check inbox",
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
      let username, domain, email;
      
      // Check if email is provided manually
      if (body.includes(' ')) {
        email = body.split(' ')[1].trim();
        if (!isValidEmail(email)) {
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
        
        // Check if email expired (1 hour)
        if (Date.now() - userEmail.createdAt > 3600000) {
          tempEmails.delete(m.sender);
          return await sock.sendMessage(m.from, { 
            text: `❌ Your temp email has expired\n\nCreate a new one with *${prefix}tempmail*`
          }, { quoted: m });
        }
        
        username = userEmail.username;
        domain = userEmail.domain;
        email = userEmail.email;
      }

      const { data: messages } = await axios.get(
        `https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`,
        { timeout: 10000 }
      );

      if (!messages || !messages.length) {
        return await sock.sendMessage(m.from, { 
          text: `📭 *Inbox Empty*\n\n${email || `${username}@${domain}`}\n\nNo messages received yet\n\nTo refresh, use: *${prefix}inbox ${email || `${username}@${domain}`}*`
        }, { quoted: m });
      }

      // Show all messages (up to 10)
      let msgText = `📬 *Inbox for ${email || `${username}@${domain}`}*\n\n`;
      msgText += `📋 *Total Messages:* ${messages.length}\n\n`;
      
      for (const [index, message] of messages.slice(0, 10).entries()) {
        msgText += `📌 *Message ${index + 1}:*\n`;
        msgText += `From: ${message.from}\n`;
        msgText += `Subject: ${message.subject || 'No Subject'}\n`;
        msgText += `Date: ${new Date(message.date).toLocaleString()}\n\n`;
      }
      
      if (messages.length > 10) {
        msgText += `ℹ️ Showing 10 of ${messages.length} messages\n`;
      }
      
      msgText += `\nTo view a specific message, use:\n*${prefix}view ${email || `${username}@${domain}`} message_number*\n\n`;
      msgText += `To refresh inbox, use:\n*${prefix}inbox ${email || `${username}@${domain}`}*`;

      await sock.sendMessage(
        m.from,
        { 
          text: msgText,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: `${messages.length} New Messages`,
              body: `Inbox: ${email || `${username}@${domain}`}`,
              thumbnailUrl: 'https://i.imgur.com/6Qf9Z3A.png'
            }
          }
        },
        { quoted: m }
      );
      await m.React('✅');
    } catch (err) {
      console.error(err);
      if (err.code === 'ECONNABORTED') {
        await sock.sendMessage(m.from, { 
          text: '*⌛ Inbox check timed out*\n\nPlease try again in a moment' 
        }, { quoted: m });
      } else {
        await sock.sendMessage(m.from, { 
          text: '*❌ Inbox check failed*\n\nServer might be down or email invalid' 
        }, { quoted: m });
      }
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
      
      if (!isValidEmail(email) || isNaN(messageNum) || messageNum < 1) {
        return await sock.sendMessage(m.from, { 
          text: `❌ Invalid format\n\nUse: *${prefix}view email@domain.com message_number*` 
        }, { quoted: m });
      }
      
      const [username, domain] = email.split('@');
      
      // Get message list first
      const { data: messages } = await axios.get(
        `https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`,
        { timeout: 10000 }
      );
      
      if (!messages?.length || messageNum > messages.length) {
        return await sock.sendMessage(m.from, { 
          text: `❌ Invalid message number\n\nThere are ${messages?.length || 0} messages in this inbox` 
        }, { quoted: m });
      }
      
      const messageId = messages[messageNum - 1].id;
      const { data: fullMsg } = await axios.get(
        `https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${messageId}`,
        { timeout: 10000 }
      );
      
      let msgText = `✉️ *Message ${messageNum} from ${fullMsg.from}*\n\n`;
      msgText += `📩 *To:* ${username}@${domain}\n`;
      msgText += `📅 *Date:* ${new Date(fullMsg.date).toLocaleString()}\n`;
      msgText += `📌 *Subject:* ${fullMsg.subject || 'No Subject'}\n\n`;
      
      // Format message body
      let messageBody = '';
      if (fullMsg.textBody) {
        messageBody = fullMsg.textBody;
      } else if (fullMsg.htmlBody) {
        // Simple HTML to text conversion
        messageBody = fullMsg.htmlBody
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // Truncate long messages
      if (messageBody.length > 1500) {
        messageBody = messageBody.substring(0, 1500) + '...\n\n[Message truncated]';
      }
      
      msgText += `📝 *Message Body:*\n${messageBody || 'No message content'}\n\n`;
      msgText += `To go back to inbox, use:\n*${prefix}inbox ${email}*`;

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
      await sock.sendMessage(m.from, { 
        text: '*❌ Failed to view message*\n\nMessage might have expired or server error occurred' 
      }, { quoted: m });
      await m.React('❌');
    }
  }
};

// Cleanup expired emails periodically
setInterval(() => {
  const now = Date.now();
  for (const [sender, emailData] of tempEmails.entries()) {
    if (now - emailData.createdAt > 3600000) { // 1 hour
      tempEmails.delete(sender);
    }
  }
}, 3600000); // Run every hour

export default tempmail;
