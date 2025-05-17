import config from '../../config.js'; // Ensure this matches your project setup
import fetch from 'node-fetch';

const gitclone = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "gitclone" || cmd === "gitcln") {
    if (!text) {
      await m.React('❌'); // React with an error icon
      return sock.sendMessage(
        m.from,
        {
          text: "❌ Where is the GitHub link?\n\nExample:\n.gitclone https://github.com/Sarkar-Bandaheali/Sarkar-MD",
        },
        { quoted: m }
      );
    }

    if (!/^(https:\/\/)?github\.com\/.+/.test(text)) {
      await m.React('⚠️'); // React with a warning icon
      return sock.sendMessage(
        m.from,
        {
          text: "⚠️ Invalid GitHub link. Please provide a valid GitHub repository URL.",
        },
        { quoted: m }
      );
    }

    try {
      const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/i;
      const match = text.match(regex);

      if (!match) {
        throw new Error("Invalid GitHub URL.");
      }

      const [, username, repo] = match;
      const zipUrl = `https://api.github.com/repos/${username}/${repo}/zipball`;

      // Check if repository exists
      const response = await fetch(zipUrl, { method: "HEAD" });
      if (!response.ok) {
        throw new Error("Repository not found.");
      }

      const contentDisposition = response.headers.get("content-disposition");
      const fileName = contentDisposition ? contentDisposition.match(/filename=(.*)/)[1] : `${repo}.zip`;

      // Notify user of the download
      await m.React('📥'); // React with a download icon
      await sock.sendMessage(
        m.from,
        {
          text: `📥 *Downloading repository...*\n\n*Repository:* ${username}/${repo}\n*Filename:* ${fileName}\n\n> *Powered by Sarkar-MD*`,
        },
        { quoted: m }
      );

      // Send the zip file to the user with custom contextInfo
      await sock.sendMessage(
        m.from,
        {
          document: { url: zipUrl },
          fileName: fileName,
          mimetype: 'application/zip',
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363315182578784@newsletter',
              newsletterName: 'Sarkar-MD',
              serverMessageId: 143,
            },
            externalAdReply: {
              title: "✨ Sarkar-MD ✨",
              body: "GitHub Repository Downloader",
              thumbnailUrl: 'https://raw.githubusercontent.com/Sarkar-Bandaheali/BALOCH-MD_DATABASE/refs/heads/main/Pairing/1733805817658.webp',
              sourceUrl: 'https://github.com/Sarkar-Bandaheali/Sarkar-MD/fork',
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        },
        { quoted: m }
      );

      await m.React('✅'); // React with a success icon
    } catch (error) {
      console.error("Error:", error);
      await m.React('❌'); // React with an error icon
      await sock.sendMessage(
        m.from,
        {
          text: "❌ Failed to download the repository. Please try again later.",
        },
        { quoted: m }
      );
    }
  }
};

export default gitclone;
