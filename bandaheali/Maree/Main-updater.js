import config from "../../config.cjs";
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

      // Download latest ZIP
      const zipPath = path.join(process.cwd(), "latest.zip");
      const { data: zipData } = await axios.get(
        "https://github.com/Bandaheali/Sarkar-MD/archive/main.zip",
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(zipPath, zipData);
      console.log("📥 ZIP file downloaded.");
      await editMessage("```📦 Extracting the latest code...```");

      // Extract ZIP
      const extractPath = path.join(process.cwd(), "latest");
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);
      console.log("📂 ZIP extracted.");
      await editMessage("```🔄 Replacing files...```");

      // Cleanup old files before replacing
      deleteOldFiles(process.cwd());

      // Replace files
      const sourcePath = path.join(extractPath, "Sarkar-MD-main");
      copyFolderSync(sourcePath, process.cwd());
      console.log("✅ Files replaced.");

      // Cleanup
      fs.unlinkSync(zipPath);
      fs.rmSync(extractPath, { recursive: true, force: true });
      console.log("🧹 Cleanup complete.");

      await editMessage("```♻️ Restarting the bot to apply updates...```");

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

// Helper function to delete all old files and folders
function deleteOldFiles(directory) {
  const files = fs.readdirSync(directory);
  
  // Delete each file/folder in the directory
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  }
  console.log("🗑️ Old files deleted.");
}

export default update;
