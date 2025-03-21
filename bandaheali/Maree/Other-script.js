import fetch from 'node-fetch';
import config from '../../config.cjs';

const sc = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "sc" || cmd === "repo") {
    await m.React('⏳'); // React with a loading icon

    const repoUrl = "https://api.github.com/repos/Sarkar-Bandaheali/Sarkar-MD";
    const commitsUrl = "https://api.github.com/repos/Sarkar-Bandaheali/Sarkar-MD/commits";
    const githubRepo = "https://github.com/Sarkar-Bandaheali/Sarkar-MD";

    try {
      // Fetch repo details
      const response = await fetch(repoUrl);
      const data = await response.json();

      // Fetch commit count
      const commitsResponse = await fetch(commitsUrl);
      const commitsData = await commitsResponse.json();
      const totalCommits = Array.isArray(commitsData) ? commitsData.length : "Unknown";

      if (!data || data.message) {
        throw new Error("GitHub API Error");
      }

      const stars = data.stargazers_count || 0;
      const forks = data.forks_count || 0;
      const watchers = data.watchers_count || 0;
      const openIssues = data.open_issues_count || 0;
      const license = data.license ? data.license.name : "No License";
      const repoSize = (data.size / 1024).toFixed(2) + " MB";
      const createdAt = new Date(data.created_at).toLocaleString("en-PK");
      const updatedAt = new Date(data.updated_at).toLocaleString("en-PK");
      const ownerAvatar = data.owner.avatar_url || "";
      
      const scText = `
🌟 *Sarkar-MD GitHub Repository* 🌟

> 🌟 Stars: ${stars}
> 🍴 Forks: ${forks}
> 👀 Watchers: ${watchers}
> ❌ Open Issues: ${openIssues}
> 📌 Total Commits: ${totalCommits}
> 📅 Created At: ${createdAt}
> 🔄 Last Updated: ${updatedAt}
> 📜 License: ${license}
> 💾 Repo Size: ${repoSize}

> 🔗 GitHub Repo: ${githubRepo}

> *Powered by Sarkar-MD*
`;

      await sock.sendMessage(
        m.from,
        {
          text: scText,
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363315182578784@newsletter',
              newsletterName: "Sarkar-MD",
              serverMessageId: -1,
            },
            forwardingScore: 999,
            externalAdReply: {
              title: "Sarkar-MD GitHub Repository",
              body: "Check out the latest details of Sarkar-MD on GitHub.",
              thumbnailUrl: ownerAvatar, // Owner's GitHub Avatar as Thumbnail
              sourceUrl: githubRepo,
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        },
        { quoted: m }
      );

      await m.React('✅'); // React with a success icon
    } catch (error) {
      await sock.sendMessage(m.from, { text: "⚠️ Error fetching GitHub data. Try again later!" }, { quoted: m });
      await m.React('❌');
    }
  }
};

export default sc;
