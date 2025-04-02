import fs from 'fs';
import path from 'path';
import axios from 'axios';
import config from '../../config.cjs';

const fullpp = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  // Check if the command is 'fullpp' and reply to an image
  if (cmd === "fullpp") {
    // Check if the message is a reply and if the replied message is an image
    if (!m.quoted || !m.quoted.mimetype.startsWith('image')) {
      return sock.sendMessage(m.from, { text: 'Please reply to an image with the command *!fullpp* to update the profile picture.' }, { quoted: m });
    }

    try {
      // Get the media (image) from the reply
      const media = await sock.downloadMediaMessage(m.quoted);

      // Update the profile picture with the received image
      await sock.updateProfilePicture(m.from, media);

      // Send a success message after profile picture update
      await sock.sendMessage(m.from, { text: 'Profile picture updated successfully!' }, { quoted: m });
    } catch (error) {
      console.error('Error updating profile picture:', error);

      // Send error message if profile picture update fails
      await sock.sendMessage(m.from, {
        text: 'Error: Profile picture update failed! There was an issue processing your request. Please try again later.',
      }, { quoted: m });
    }
  }
};

export default fullpp;
