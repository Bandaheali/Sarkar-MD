import fs from 'fs';
import path from 'path';
import axios from 'axios';
import config from '../../config.js';

const fullpp = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  // Check if the command is 'fullpp' and reply to an image
  if (cmd === "fullpp") {
    // Ensure the message is a reply and the reply is an image
    if (!m.quoted || !m.quoted.mimetype.startsWith('image')) {
      return sock.sendMessage(m.from, { text: 'Please reply to an image with the command *!fullpp* to update the profile picture.' }, { quoted: m });
    }

    try {
      // Download the media (image) from the quoted message
      const media = await sock.downloadMediaMessage(m.quoted);

      if (!media) {
        throw new Error('No media found in the quoted message');
      }

      // Logging to ensure media is being correctly fetched
      console.log('Media successfully downloaded.');

      // Attempt to update profile picture with the downloaded media
      await sock.updateProfilePicture(m.from, media);

      // Send a success message after profile picture update
      await sock.sendMessage(m.from, { text: 'Profile picture updated successfully!' }, { quoted: m });
    } catch (error) {
      // Log the error on the server
      console.error('Error during profile picture update:', error);

      // Send an error message to the user
      await sock.sendMessage(m.from, {
        text: `Error: Profile picture update failed! Reason: ${error.message}. Please try again later.`,
      }, { quoted: m });
    }
  }
};

export default fullpp;
