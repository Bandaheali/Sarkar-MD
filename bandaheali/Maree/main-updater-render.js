import config from "../../config.cjs";
import axios from "axios";
import fs from "fs";
import { exec } from "child_process";
import path from "path";

const rupdate = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  if (cmd === "rupdate") {
    if (!config.OWNER_NUMBER.includes(m.sender.split("@")[0])) {
      return sock.sendMessage(m.from, { text: "❌ *Only the bot owner can use this command!*" }, { quoted: m });
    }

    await m.React("⏳"); // React with a loading icon

    try {
      console.log("🔄 Checking for Sarkar-MD updates...");
      
      // Send initial message
      const msg = await sock.sendMessage(m.from, { text: "```🔍 Checking for Sarkar-MD updates...```" }, { quoted: m });

      // Function to edit the message smoothly
      const editMessage = async (newText) => {
        try {
          await sock.sendMessage(m.from, { text: newText, edit: msg.key });
        } catch (error) {
          console.error("Message edit failed:", error);
        }
      };

      // Fetch latest commit hash
      const { data: commitData } = await axios.get(
        "https://api.github.com/repos/Bandaheali/Sarkar-MD/commits/main"
      );
      const latestCommitHash = commitData.sha;

      // Load package.json
      const packageJsonPath = path.join(process.cwd(), "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const currentHash = packageJson.commitHash || "unknown";

      console.log("📌 Current commit:", currentHash);
      console.log("📥 Latest commit:", latestCommitHash);

      if (latestCommitHash === currentHash) {
        await m.React("✅"); // React with success icon
        return editMessage("```✅ Sarkar-MD is already up to date!```");
      }

      await editMessage("```🚀 Sarkar-MD Bot Updating...```");

      // Execute git pull for Render
      exec("git pull && npm install", async (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Update failed: ${error.message}`);
          await m.React("❌");
          return editMessage("❌ *Update failed! Please update manually on Render.*");
        }
        console.log(`✅ Git pull successful:\n${stdout}`);

        await editMessage("```♻️ Update complete! Restarting the bot manually is required.```");

        // Render does not support `process.exit(0)`, so manual restart is needed
        await sock.sendMessage(m.from, { text: "⚠️ *Render users:* Please restart the bot manually from the dashboard to apply updates." }, { quoted: m });
      });
    } catch (error) {
      console.error("❌ Update error:", error);
      await m.React("❌"); // React with an error icon
      await sock.sendMessage(m.from, { text: "❌ Update failed. Please try manually." }, { quoted: m });
    }
  }
};

export default rupdate;
