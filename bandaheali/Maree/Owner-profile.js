import axios from 'axios';

const person = async (m, sock, groupMetadata) => {
  const prefix = '.';
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "person" || cmd === "userinfo" || cmd === "profile") {
    try {
      const isGroup = !!groupMetadata;
      let userJid = m.quoted?.sender || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.sender;

      const [user] = await sock.onWhatsApp(userJid).catch(() => []);
      if (!user?.exists) return sock.sendMessage(m.from, { text: "❌ User not found on WhatsApp" }, { quoted: m });

      let ppUrl;
      try {
        ppUrl = await sock.profilePictureUrl(userJid, 'image');
      } catch {
        ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
      }

      let userName = userJid.split('@')[0];
      try {
        if (isGroup) {
          const participant = groupMetadata.participants.find(p => p.id === userJid);
          if (participant?.notify) userName = participant.notify;
        }
        if (userName === userJid.split('@')[0]) {
          const presence = await sock.presenceSubscribe(userJid).catch(() => null);
          if (presence?.pushname) userName = presence.pushname;
        }
      } catch (e) {
        console.log("Name fetch error:", e);
      }

      let bio = {};
      try {
        const statusData = await sock.fetchStatus(userJid).catch(() => null);
        if (statusData?.status) {
          bio = {
            text: statusData.status,
            type: "Personal",
            updated: statusData.setAt ? new Date(statusData.setAt * 1000) : null
          };
        }
      } catch (e) {
        console.log("Bio fetch error:", e);
      }

      let groupRole = "";
      if (isGroup) {
        const participant = groupMetadata.participants.find(p => p.id === userJid);
        groupRole = participant?.admin ? "👑 Admin" : "👥 Member";
      }

      const formattedBio = bio.text ?
        `${bio.text}\n└─ 📌 ${bio.type} Bio${bio.updated ? ` | 🕒 ${bio.updated.toLocaleString()}` : ''}` :
        "No bio available";

      const userInfo = `
*👤 USER PROFILE INFORMATION*

📛 *Name:* ${userName}
🔢 *Number:* ${userJid.replace(/@.+/, '')}
📌 *Account Type:* ${user.isBusiness ? "💼 Business" : "👤 Personal"}

📝 *Bio:*
${formattedBio}

⚙️ *Account Info:*
✅ Registered: ${user.isUser ? "Yes" : "No"}
🛡️ Verified: ${user.verifiedName ? "✅ Verified" : "❌ Not verified"}
${isGroup ? `👥 *Group Role:* ${groupRole}` : ''}
`.trim();

      await sock.sendMessage(m.from, {
        image: { url: ppUrl },
        caption: userInfo,
        mentions: [userJid]
      }, { quoted: m });

    } catch (e) {
      console.error("Person command error:", e);
      sock.sendMessage(m.from, { text: `❌ Error: ${e.message || "Failed to fetch profile"}` }, { quoted: m });
    }
  }
};

export default person;
