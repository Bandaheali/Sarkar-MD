import fs from 'fs';
import path from 'path';
import axios from 'axios';
import config from '../../config.cjs';

const fullpp = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  // Check if the command is 'fullpp'
  if (cmd === "fullpp") {
    if (!m.quoted || !m.quoted.mimetype.startsWith('image')) {
      return sock.sendMessage(m.from, { text: 'Please reply to an image with the command *!fullpp* to update the profile picture.' }, { quoted: m });
    }

    // Get the image URL
    const media = await sock.downloadMediaMessage(m.quoted);
    
    try {
      // Update the profile picture with the received image
      await sock.updateProfilePicture(m.from, media);
      await sock.sendMessage(m.from, { text: 'Profile picture updated successfully!' }, { quoted: m });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      await sock.sendMessage(m.from, { text: 'Failed to update profile picture. Please try again later.' }, { quoted: m });
    }
  }
};

export default fullpp;
