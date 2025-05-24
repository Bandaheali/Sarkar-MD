import axios from 'axios';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const igstalk = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const username = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "igstalk") return;

    try {
        if (!username) {
            await sendNewsletter(
                sock,
                m.from,
                "⚠️ *Please provide an Instagram username*\nExample: `.igstalk bandaheali`",
                m,
                "📷 Instagram Stalker",
                "Username Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Fetch Instagram user data
        const apiUrl = `https://api.paxsenix.biz.id/stalker/instagram?username=${encodeURIComponent(username)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.ok || !data.avatar) {
            throw new Error("User not found or private account");
        }

        // Format user info
        const userInfo = `
📛 *Username:* ${username}
👤 *Nickname:* ${data.nickname || 'Not available'}
📝 *Bio:* ${data.bio || 'No bio'}

📊 *Statistics:*
📸 *Posts:* ${data.postsCount}
👥 *Followers:* ${data.followersCount}
🤝 *Following:* ${data.followingCount}

💬 *Recent Posts:* ${data.posts?.length || 0} shown
`;

        // Send user info with profile picture
        await sock.sendMessage(
            m.from,
            {
                image: { url: data.avatar },
                caption: userInfo,
                contextInfo: {
                    externalAdReply: {
                        title: `📷 ${data.nickname}'s Instagram`,
                        body: `${data.followersCount} followers | ${data.postsCount} posts`,
                        thumbnailUrl: data.avatar,
                        sourceUrl: `https://instagram.com/${username}`,
                        mediaType: 1
                    }
                }
            },
            { quoted: m }
        );

        // Send recent posts (first 3)
        if (data.posts?.length > 0) {
            const postsToShow = data.posts.slice(0, 3);
            let postsInfo = `*Recent Posts Preview:*\n\n`;
            
            postsToShow.forEach((post, index) => {
                postsInfo += `📌 *Post ${index + 1}:*\n`;
                if (post.description) postsInfo += `${post.description}\n`;
                if (post.hashtags?.length > 0) {
                    postsInfo += `🏷️ *Tags:* ${post.hashtags.join(' ')}\n`;
                }
                postsInfo += `\n`;
            });

            await sock.sendMessage(
                m.from,
                { text: postsInfo },
                { quoted: m }
            );
        }

        await m.React('✅');

    } catch (error) {
        console.error("Instagram Stalk Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Profile Not Found*\n\n• Check username spelling\n• Account may be private\n• Try different username",
            m,
            "📷 Instagram Stalker",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default igstalk;
