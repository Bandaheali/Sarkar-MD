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

    let sentMsg = await sock.sendMessage(m.from, { text: "🔍 Searching NPM..." }, { quoted: m });

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Package not found!");

      const data = await response.json();
      const latestVersion = data["dist-tags"]?.latest || "Unknown";
      const description = data.description || "No description available";
      const author = data.author?.name || "Unknown";
      const homepage = data.homepage || `https://www.npmjs.com/package/${packageName}`;

      const message = `🛠 *NPM Package Info*\n\n📦 *Package:* ${packageName}\n🔖 *Version:* ${latestVersion}\n👤 *Author:* ${author}\n📜 *Description:* ${description}\n🔗 *Homepage:* [Click Here](${homepage})`;

      // Animated Typing Effect
      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "N" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "NP" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "NPM" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "NPM S" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "NPM SE" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "NPM SEARCH" });

      await new Promise(resolve => setTimeout(resolve, 500));
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: message });

      // External Ad Reply
      await sock.sendMessage(
        m.from,
        {
          text: `🔍 *NPM Search Result: ${packageName}*`,
          contextInfo: {
            externalAdReply: {
              title: `NPM Package: ${packageName}`,
              body: `Version: ${latestVersion} | Author: ${author}`,
              thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/d/db/Npm-logo.svg",
              sourceUrl: homepage,
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        },
        { quoted: m }
      );

    } catch (error) {
      await sock.sendMessage(m.from, { edit: sentMsg.key, text: "❌ *Package not found!*" });
    }
  }
};

export default npmInfo;
