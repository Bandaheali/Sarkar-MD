import fetch from "node-fetch";
import config from "../../config.cjs";

const npmInfo = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  const args = m.body.slice(prefix.length).split(" ").slice(1);
  if (cmd === "npm") {
    if (!args.length) {
      return await sock.sendMessage(m.from, { text: "🔍 *Please provide a package name!*\nExample: `.npm express`" }, { quoted: m });
    }

    const packageName = args[0];
    const url = `https://registry.npmjs.org/${packageName}`;

    let sentMsg = await sock.sendMessage(m.from, { text: "🔍 𝐒𝐄𝐀𝐑𝐂𝐇𝐈𝐍𝐆 𝐍𝐏𝐌.." }, { quoted: m });

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Package not found!");

      const data = await response.json();
      const latestVersion = data["dist-tags"]?.latest || "Unknown";
      const description = data.description || "No description available";
      const author = data.author?.name || "Unknown";
      const homepage = data.homepage || `https://www.npmjs.com/package/${packageName}`;

      const message = `🛠 *𝐒𝐚𝐫𝐤𝐚𝐫-𝐌𝐃 𝐍𝐩𝐦 𝐈𝐧𝐟𝐨*\n\n📦 *𝐏𝐚𝐜𝐤𝐚𝐠𝐞:* ${packageName}\n🔖 *𝐕𝐞𝐫𝐬𝐢𝐨𝐧:* ${latestVersion}\n👤 *𝐀𝐮𝐭𝐡𝐨𝐫:* ${author}\n📜 *𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧:* ${description}\n🔗 *𝐇𝐨𝐦𝐞𝐏𝐚𝐠𝐞:*(${homepage})\n\n*_𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐒𝐀𝐑𝐊𝐀𝐑-𝐌𝐃_*`;

      // Animated Typing Effect
      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐍" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐍𝐏" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐍𝐏𝐌" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐍𝐏𝐌 𝐒" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐍𝐏𝐌 𝐒𝐄" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐍𝐏𝐌 𝐒𝐄𝐀" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐍𝐏𝐌 𝐒𝐄𝐀𝐑" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐍𝐏𝐌 𝐒𝐄𝐀𝐑𝐂" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "𝐍𝐏𝐌 𝐒𝐄𝐀𝐑𝐂𝐇" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: message });

    } catch (error) {
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "❌ *Package not found or API Error!*" });
    }
  }
};

export default npmInfo;
