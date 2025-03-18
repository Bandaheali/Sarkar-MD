import config from "../../config.cjs"; // Ensure this matches your project setup
import axios from "axios";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

const update = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  if (cmd === "update") {
    await m.React("⏳"); // React with a loading icon

    try {
      console.log("🔄 Checking for Sarkar-MD updates...");
      await sock.sendMessage(m.from, { text: "```🔍 Checking for Sarkar-MD updates...```" }, { quoted: m });

      // Fetch the latest commit hash from GitHub
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
        await m.React("✅"); // React with a success icon
        return sock.sendMessage(m.from, { text: "```✅ Your Sarkar-MD is already on the latest update!```" }, { quoted: m });
      }

      await sock.sendMessage(m.from, { text: "```🚀 Sarkar-MD Bot Updating...```" }, { quoted: m });

      // Download the latest code as ZIP
      const zipPath = path.join(process.cwd(), "latest.zip");
      const { data: zipData } = await axios.get(
        "https://github.com/Bandaheali/Sarkar-MD/archive/main.zip",
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(zipPath, zipData);
      console.log("📥 ZIP file downloaded.");

      await sock.sendMessage(m.from, { text: "```📦 Extracting the latest code...```" }, { quoted: m });

      // Extract ZIP file
      const extractPath = path.join(process.cwd(), "latest");
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);
      console.log("📂 ZIP extracted.");

      await sock.sendMessage(m.from, { text: "```🔄 Replacing files...```" }, { quoted: m });

      // Replace files with updated versions
      const sourcePath = path.join(extractPath, "Sarka-MD-main");
      copyFolderSync(sourcePath, process.cwd());
      console.log("✅ Files replaced.");

      // Cleanup temporary files
      fs.unlinkSync(zipPath);
      fs.rmSync(extractPath, { recursive: true, force: true });
      console.log("🧹 Cleanup complete.");

      await sock.sendMessage(m.from, { text: "```♻️ Restarting the bot to apply updates...```" }, { quoted: m });

      process.exit(0); // Restart bot
    } catch (error) {
      console.error("❌ Update error:", error);
      await m.React("❌"); // React with an error icon
      await sock.sendMessage(m.from, { text: "❌ Update failed. Please try manually." }, { quoted: m });
    }
  }
};

// Helper function to copy directories and files
function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);
  for (const item of items) {
    const srcPath = path.join(source, item);
    const destPath = path.join(target, item);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default update;
