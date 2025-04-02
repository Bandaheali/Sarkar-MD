import config from '../../config.cjs';

const privacyMenu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  // Check if the user is the owner
  

  if (['privacy', 'privacymenu'].includes(cmd)) {
    if (m.sender !== config.OWNER_NUMBER) {
    return sock.sendMessage(m.from, { text: 'HUSH HUSH YOU ARE NOT THE OWNER' });
    }
    
    const privacyText = `╭━━〔 *Privacy Settings* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• blocklist - View blocked users
┃◈┃• getbio - Get user's bio
┃◈┃• setppall - Set profile pic privacy
┃◈┃• setonline - Set online privacy
┃◈┃• setpp - Change bot's profile pic
┃◈┃• setmyname - Change bot's name
┃◈┃• updatebio - Change bot's bio
┃◈┃• groupsprivacy - Set group add privacy
┃◈┃• getprivacy - View current privacy settings
┃◈┃• getpp - Get user's profile picture
┃◈┃
┃◈┃*Options for privacy commands:*
┃◈┃• all - Everyone
┃◈┃• contacts - My contacts only
┃◈┃• contact_blacklist - Contacts except blocked
┃◈┃• none - Nobody
┃◈┃• match_last_seen - Match last seen
┃◈└───────────┈⊷
╰──────────────┈⊷
*Note:* Most commands are owner-only`;

    await m.React('⏳'); // React with a loading icon

    await sock.sendMessage(
      m.from,
      { text: privacyText },
      { quoted: m }
    );

    await m.React('✅'); // React with a success icon
  }
};

export default privacyMenu;
