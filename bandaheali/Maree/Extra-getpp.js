import config from '../../config.js';
import axios from 'axios';
import fs from 'fs';
import { tmpdir } from 'os';
import { promisify } from 'util';
import { Sticker, createSticker, StickerTypes } from 'wa-sticker-formatter';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const getpp = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (["getpp", "getprofilepic", "dp"].includes(cmd)) {
    try {
      // Check if user wants sticker version
      const isSticker = m.body.includes('--sticker') || m.body.includes('-s');

      // Get target user (quoted or mentioned)
      let userId;
      if (m.quoted) {
        userId = m.quoted.sender || m.quoted.participant;
      } else if (m.mentionedJid?.length > 0) {
        userId = m.mentionedJid[0];
      } else {
        // Get sender's own DP if no reply/mention
        userId = m.sender;
      }

      if (!userId) {
        return await m.reply("❌ Could not identify user. Reply to a message or mention someone.");
      }

      // Get high quality profile picture
      const ppUrl = await sock.profilePictureUrl(userId, 'image', 'preview');
      
      // Temporary file path
      const tempPath = `${tmpdir()}/${Math.random().toString(36)}.jpg`;

      try {
        // Download the image
        const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
        await writeFile(tempPath, response.data);

        // Get user info
        const contact = await sock.onWhatsApp(userId);
        const username = contact[0]?.name || userId.split('@')[0];

        if (isSticker) {
          // Create sticker
          const sticker = new Sticker(tempPath, {
            pack: 'Profile Picture',
            author: username,
            type: StickerTypes.FULL,
            categories: ['🤩', '🎉'],
            id: '12345',
            quality: 70,
          });
          
          await sock.sendMessage(
            m.chat,
            await sticker.toMessage(),
            { quoted: m }
          );
        } else {
          // Send as image
          await sock.sendMessage(
            m.chat,
            { 
              image: fs.readFileSync(tempPath),
              caption: `🌟 ${username}'s Profile Picture\n@${userId.split('@')[0]}`,
              mentions: [userId],
              jpegThumbnail: fs.readFileSync(tempPath),
            },
            { quoted: m }
          );
        }

      } catch (error) {
        console.error("Error processing profile picture:", error);
        // Send default image if error occurs
        await sock.sendMessage(
          m.chat,
          { 
            image: { url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' }, 
            caption: '⚠️ Could not fetch profile picture',
          },
          { quoted: m }
        );
      } finally {
        // Clean up temp file
        try { await unlink(tempPath); } catch {}
      }

    } catch (error) {
      console.error("Profile Picture Error:", error);
      await m.reply(`❌ An error occurred while fetching the profile picture ${error.message}`);
    }
  }
};

export default getpp;
