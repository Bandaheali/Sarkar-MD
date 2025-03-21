import fetch from "node-fetch";
import config from "../../config.cjs";

const githubInfo = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  const args = m.body.slice(prefix.length).split(" ").slice(1);
  if (cmd === "gitstalk") {
    if (!args.length) {
      return await sock.sendMessage(m.from, { text: "🔍 *Please provide a GitHub username!*\nExample: `.github torvalds`" }, { quoted: m });
    }

    const username = args[0];
    const url = `https://api.github.com/users/${username}`;

    let sentMsg = await sock.sendMessage(m.from, { text: "🔍 𝐒𝐄𝐀𝐑𝐂𝐇𝐈𝐍𝐆 𝐆𝐈𝐓𝐇𝐔𝐁.." }, { quoted: m });

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("User not found!");

      const data = await response.json();
      const name = data.name || "No name available";
      const bio = data.bio || "No bio available";
      const repos = data.public_repos || 0;
      const followers = data.followers || 0;
      const following = data.following || 0;
      const profileUrl = data.html_url || `https://github.com/${username}`;

      const message = `🐙 *𝐒𝐚𝐫𝐤𝐚𝐫-𝐌𝐃 𝐆𝐢𝐭𝐇𝐮𝐛 𝐈𝐧𝐟𝐨*\n\n👤 *𝐍𝐚𝐦𝐞:* ${name}\n📜 *𝐁𝐢𝐨:* ${bio}\n📦 *𝐑𝐞𝐩𝐨𝐬:* ${repos}\n👥 *𝐅𝐨𝐥𝐥𝐨𝐰𝐞𝐫𝐬:* ${followers}\n👣 *𝐅𝐨𝐥𝐥𝐨𝐰𝐢𝐧𝐠:* ${following}\n🔗 *𝐏𝐫𝐨𝐟𝐢𝐥𝐞:*(${profileUrl})\n\n*_𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐒𝐀𝐑𝐊𝐀𝐑-𝐌𝐃_*`;

      // Animated Typing Effect
      const searchSteps = ["𝐆", "𝐆𝐈", "𝐆𝐈𝐓", "𝐆𝐈𝐓𝐇", "𝐆𝐈𝐓𝐇𝐔", "𝐆𝐈𝐓𝐇𝐔𝐁", "𝐆𝐈𝐓𝐇𝐔𝐁 𝐒", "𝐆𝐈𝐓𝐇𝐔𝐁 𝐒𝐄", "𝐆𝐈𝐓𝐇𝐔𝐁 𝐒𝐄𝐀", "𝐆𝐈𝐓𝐇𝐔𝐁 𝐒𝐄𝐀𝐑", "𝐆𝐈𝐓𝐇𝐔𝐁 𝐒𝐄𝐀𝐑𝐂", "𝐆𝐈𝐓𝐇𝐔𝐁 𝐒𝐄𝐀𝐑𝐂𝐇"];
      for (const step of searchSteps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await sock.sendMessage(m.from, { edit: sentMsg.key, text: step });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: message });

    } catch (error) {
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "❌ *GitHub user not found or API Error!*" });
    }
  }
};

export default githubInfo;
