import axios from 'axios';
import config from '../../config.js';

const githubStalk = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();
  const args = text.split(' ');

  const validCommands = ['githubstalk', 'ghstalk', 'gstalk', 'ginfo'];

  if (!validCommands.includes(cmd)) return;

  if (!args[0]) {
    return m.reply('Please provide a GitHub username to stalk.\nExample: *!ghstalk octocat*');
  }

  const username = args[0];

  try {
    // Fetch user data
    const [userResponse, reposResponse] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`),
      axios.get(`https://api.github.com/users/${username}/repos`, {
        params: {
          per_page: 5,
          sort: 'updated',
          direction: 'desc'
        }
      })
    ]);

    const userData = userResponse.data;
    const reposData = reposResponse.data;

    // Format user information
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    let responseMessage = `🌟 *GitHub Profile - @${userData.login}* 🌟\n\n`;
    responseMessage += `👤 *Name*: ${userData.name || 'Not specified'}\n`;
    responseMessage += `📌 *Username*: @${userData.login}\n`;
    responseMessage += `📝 *Bio*: ${userData.bio || 'No bio available'}\n\n`;
    
    responseMessage += `🔗 *Links*\n`;
    responseMessage += `  ◦ *Profile*: ${userData.html_url}\n`;
    responseMessage += `  ◦ *Website*: ${userData.blog || 'Not specified'}\n\n`;
    
    responseMessage += `🏢 *Work & Location*\n`;
    responseMessage += `  ◦ *Company*: ${userData.company || 'Not specified'}\n`;
    responseMessage += `  ◦ *Location*: ${userData.location || 'Not specified'}\n\n`;
    
    responseMessage += `📊 *Stats*\n`;
    responseMessage += `  ◦ *Repositories*: ${userData.public_repos}\n`;
    responseMessage += `  ◦ *Gists*: ${userData.public_gists}\n`;
    responseMessage += `  ◦ *Followers*: ${userData.followers}\n`;
    responseMessage += `  ◦ *Following*: ${userData.following}\n\n`;
    
    responseMessage += `📅 *Dates*\n`;
    responseMessage += `  ◦ *Joined*: ${formatDate(userData.created_at)}\n`;
    responseMessage += `  ◦ *Last Updated*: ${formatDate(userData.updated_at)}\n`;

    // Add recent repositories if available
    if (reposData.length > 0) {
      responseMessage += `\n📦 *Recent Repositories*\n`;
      
      reposData.slice(0, 5).forEach(repo => {
        responseMessage += `\n🔹 *${repo.name}*`;
        responseMessage += `\n  ◦ *Description*: ${repo.description || 'No description'}`;
        responseMessage += `\n  ◦ *Language*: ${repo.language || 'Not specified'}`;
        responseMessage += `\n  ◦ *Stars*: ⭐ ${repo.stargazers_count} | Forks: 🍴 ${repo.forks}`;
        responseMessage += `\n  ◦ *URL*: ${repo.html_url}`;
      });
    } else {
      responseMessage += `\n\nNo public repositories found.`;
    }

    // Send message with profile picture and formatted text
    await gss.sendMessage(
      m.from, 
      {
        image: { url: userData.avatar_url },
        caption: responseMessage,
        footer: `GitHub Stalker • ${new Date().toLocaleDateString()}`,
        templateButtons: [
          { urlButton: { displayText: 'View Profile', url: userData.html_url } },
          { urlButton: { displayText: 'View Repositories', url: `${userData.html_url}?tab=repositories` } }
        ]
      }, 
      { quoted: m }
    );

  } catch (error) {
    console.error('GitHub Stalk Error:', error);
    
    if (error.response?.status === 404) {
      return m.reply(`User *${username}* not found on GitHub.`);
    } else if (error.response?.status === 403) {
      return m.reply('GitHub API rate limit exceeded. Please try again later.');
    } else {
      return m.reply('An error occurred while fetching GitHub data. Please try again later.');
    }
  }
};

export default githubStalk;
