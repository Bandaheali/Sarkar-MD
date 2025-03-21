import fetch from "node-fetch";
import config from "../../config.cjs";

const instaStalker = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  const args = m.body.slice(prefix.length).split(" ").slice(1);
  if (cmd === "instastalker") {
    if (!args.length) {
      return await sock.sendMessage(m.from, { text: "🔍 *Please provide an Instagram username!*\nExample: `.instastalker cristiano`" }, { quoted: m });
    }

    const username = args[0];
    const url = `https://insta-stalker-api.vercel.app/user/${username}`;

    let sentMsg = await sock.sendMessage(m.from, { text: "🔍 𝐒𝐄𝐀𝐑𝐂𝐇𝐈𝐍𝐆 𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌.." }, { quoted: m });

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("User not found!");

      const data = await response.json();
      if (!data.username) throw new Error("Invalid username!");

      const name = data.fullName || "No name available";
      const bio = data.bio || "No bio available";
      const posts = data.posts || 0;
      const followers = data.followers || 0;
      const following = data.following || 0;
      const profilePic = data.profilePic || "";
      const profileUrl = `https://www.instagram.com/${username}`;

      const message = `📸 *𝐒𝐚𝐫𝐤𝐚𝐫-𝐌𝐃 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐒𝐭𝐚𝐥𝐤𝐞𝐫*\n\n👤 *𝐍𝐚𝐦𝐞:* ${name}\n📜 *𝐁𝐢𝐨:* ${bio}\n📸 *𝐏𝐨𝐬𝐭𝐬:* ${posts}\n👥 *𝐅𝐨𝐥𝐥𝐨𝐰𝐞𝐫𝐬:* ${followers}\n👣 *𝐅𝐨𝐥𝐥𝐨𝐰𝐢𝐧𝐠:* ${following}\n🔗 *𝐏𝐫𝐨𝐟𝐢𝐥𝐞:* (${profileUrl})\n\n*_𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐒𝐀𝐑𝐊𝐀𝐑-𝐌𝐃_*`;
      // Animated Typing Effect
      const searchSteps = ["𝐈", "𝐈𝐍", "𝐈𝐍𝐒", "𝐈𝐍𝐒𝐓", "𝐈𝐍𝐒𝐓𝐀", "𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌", "𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌 𝐒𝐄𝐀", "𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌 𝐒𝐄𝐀𝐑𝐂𝐇"];
      for (const step of searchSteps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await sock.sendMessage(m.from, { edit: sentMsg.key, text: step });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (profilePic) {
        await sock.sendMessage(m.from, { image: { url: profilePic }, caption: message });
      } else {
        await sock.sendMessage(m.from, { edit: sentMsg.key, text: message });
      }

    } catch (error) {
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "❌ *Instagram user not found or API Error!*" });
    }
  }
};

export default instaStalker;
