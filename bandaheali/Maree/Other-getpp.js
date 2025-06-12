import config from '../../config.js';

const getpp = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["getpp", "getprofilepic"].includes(cmd)) {
    // Check if user is owner/creator
    const owner = config.OWNER_NUMBER;
    const bot = await sock.decodeJid(sock.user.id);
    const dev = "923253617422@s.whatsapp.net";
    const isCreator = [owner, bot, dev].includes(m.sender);
    
 //   if (!isCreator) {
 //     await m.reply("🚫 This command is only for my owner!");
 //     return;
   // }

    try {
      if (!m.quoted) {
        return await m.reply("Reply to a user's message to get their profile picture");
      }

      // Get user ID from quoted message
      const userId = m.quoted.sender || m.quoted.participant;
      
      if (!userId) {
        return await m.reply("Could not find user in the quoted message");
      }

      // Get profile picture
      const ppUrl = await sock.profilePictureUrl(userId, 'image');
      
      // Send the profile picture
      await sock.sendMessage(
        m.chat,
        { 
          image: { url: ppUrl }, 
          caption: `🔹 Profile Picture of: @${userId.split('@')[0]}`,
          mentions: [userId]
        },
        { quoted: m }
      );
      
    } catch (error) {
      console.error("Profile Picture Error:", error);
      // Send default image if no profile picture found
      await sock.sendMessage(
        m.chat,
        { 
          image: { url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' }, 
          caption: '⚠️ No profile picture found'
        },
        { quoted: m }
      );
    }
  }
};

export default getpp;
