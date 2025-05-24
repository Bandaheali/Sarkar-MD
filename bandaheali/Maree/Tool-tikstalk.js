import axios from 'axios';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const tstalk = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const username = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "tstalk") return;

    try {
        if (!username) {
            await sendNewsletter(
                sock,
                m.from,
                "⚠️ *Please provide a TikTok username*\nExample: `.tstalk khaby.lame`",
                m,
                "📱 TikTok Stalker",
                "Username Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Fetch TikTok user data
        const apiUrl = `https://api.paxsenix.biz.id/stalker/tiktok?username=${encodeURIComponent(username)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.ok || !data.userInfo) {
            throw new Error("User not found or private account");
        }

        const user = data.userInfo.user;
        const stats = data.userInfo.stats;

        // Format user info
        const userInfo = `
📛 *Username:* ${user.uniqueId}
👤 *Nickname:* ${user.nickname}
📅 *Created:* ${new Date(user.createTime * 1000).toLocaleDateString()}
📍 *Region:* ${user.region}
✅ *Verified:* ${user.verified ? 'Yes' : 'No'}

📊 *Statistics:*
👥 *Followers:* ${stats.followerCount}
🤝 *Following:* ${stats.followingCount}
❤️ *Likes:* ${stats.heartCount}
🎬 *Videos:* ${stats.videoCount}

📝 *Bio:*
${user.signature || 'No bio available'}
`;

        // Send user info with profile picture
        await sock.sendMessage(
            m.from,
            {
                image: { url: user.avatarLarger },
                caption: userInfo,
                contextInfo: {
                    externalAdReply: {
                        title: `📱 ${user.nickname}'s TikTok Profile`,
                        body: `${stats.followerCount} followers | ${stats.videoCount} videos`,
                        thumbnailUrl: user.avatarThumb,
                        sourceUrl: `https://tiktok.com/@${user.uniqueId}`,
                        mediaType: 1
                    }
                }
            },
            { quoted: m }
        );

        await m.React('✅');

    } catch (error) {
        console.error("TikTok Stalk Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Profile Not Found*\n\n• Check username spelling\n• Account may be private\n• Try different username",
            m,
            "📱 TikTok Stalker",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default tstalk;
