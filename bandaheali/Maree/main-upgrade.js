import config from '../../config.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';

const update = async (message, client) => {
  const prefix = config.PREFIX;
  const command = message.body.startsWith(prefix) 
    ? message.body.slice(prefix.length).split(" ")[0].toLowerCase() 
    : '';
  
  if (command === "upgrade") {
    // Check if user is owner
    if (!config.OWNER_NUMBER.includes(message.sender.split('@')[0])) {
      const response = { text: "❌ *Only the bot owner can use this command!*" };
      return client.sendMessage(message.from, response, { quoted: message });
    }

    await message.React('⏳');
    
    try {
      console.log("🔄 Checking for updates...");
      const initialMessage = { text: "```🔍 Checking for updates...```" };
      const sentMessage = await client.sendMessage(message.from, initialMessage, { quoted: message });

      // Helper function to edit the progress message
      const editMessage = async (text) => {
        try {
          const editPayload = { text, edit: sentMessage.key };
          await client.sendMessage(message.from, editPayload);
        } catch (error) {
          console.error("Message edit failed:", error);
        }
      };

      // Get latest commit from GitHub
      const { data: commitData } = await axios.get(
        "https://api.github.com/repos/Bandaheali/Sarkar-MD/commits/main",
        { timeout: 10000 }
      );
      const latestCommitHash = commitData.sha;
      
      // Start update process
      await editMessage("```🚀 Downloading updates...```");
      
      // Download latest code
      const zipPath = path.join(process.cwd(), "latest.zip");
      const { data: zipData } = await axios.get(
        "https://github.com/Bandaheali/Sarkar-MD/archive/main.zip", 
        { 
          responseType: "arraybuffer",
          timeout: 30000 
        }
      );
      fs.writeFileSync(zipPath, zipData);
      console.log("📥 ZIP file downloaded.");

      // Extract downloaded zip
      await editMessage("```📦 Extracting updates...```");
      const extractPath = path.join(process.cwd(), 'latest');
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);
      console.log("📂 ZIP extracted.");

      // Replace files (only skip specified files)
      await editMessage("```🔄 Updating files...```");
      const sourcePath = path.join(extractPath, "Sarkar-MD-main");
      await copyFolderSync(sourcePath, process.cwd());
      console.log("✅ Files updated.");

      // Install dependencies if package.json exists
      if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
        await editMessage("```🔧 Installing dependencies...```");
        execSync('npm install --production', { stdio: 'inherit' });
        console.log("📦 Dependencies installed");
      }

      // Cleanup
      fs.unlinkSync(zipPath);
      fs.rmSync(extractPath, { recursive: true, force: true });
      console.log("🧹 Cleanup complete.");

      // Restart bot
      await editMessage("```♻️ Restarting to apply updates...```");
      process.exit(1);
      
    } catch (error) {
      console.error("❌ Update error:", error);
      await message.React('❌');
      const errorResponse = { text: `❌ Update failed: ${error.message}` };
      await client.sendMessage(message.from, errorResponse, { quoted: message });
    }
  }
};

// Minimal folder copy function that only skips specified files
async function copyFolderSync(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);
  const skipFiles = [
    'config.js',
    'lib/settings.js',
    'lib/settings.json'
  ];
  
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    // Skip only the specified files
    if (skipFiles.some(skipFile => destPath.endsWith(skipFile))) {
      console.log(`🔒 Skipping ${file}`);
      continue;
    }

    if (fs.lstatSync(sourcePath).isDirectory()) {
      await copyFolderSync(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

export default update;
