import axios from 'axios';
import config from '../../config.js';

const rmbg = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === 'rmbg') {
    try {
      // Check if message is a reply
      if (!m.quoted) {
        return sock.sendMessage(
          m.from,
          { text: '❌ Please reply to an image with *.rmbg* to remove its background' },
          { quoted: m }
        );
      }

      // Check if the quoted message is an image
      const isImage =
        m.quoted.mimetype?.includes('image') ||
        m.quoted.message?.imageMessage ||
        m.quoted?.type === 'image';

      if (!isImage) {
        return sock.sendMessage(
          m.from,
          { text: '❌ The replied message is not an image. Please reply to an image.' },
          { quoted: m }
        );
      }

      // React with loading emoji
      await sock.sendMessage(m.from, { react: { text: '⏳', key: m.key } });

      // Download the image using safer method
      let media;
      try {
        media = await m.quoted.download();
        if (!media) throw new Error('Media download returned null');
      } catch (err) {
        console.error('Download failed:', err);
        return sock.sendMessage(
          m.from,
          { text: '❌ Failed to download image. Please try again with a different image.' },
          { quoted: m }
        );
      }

      const imageBase64 = media.toString('base64');

      // API call to remove background
      const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg`;

      const response = await axios.post(
        apiUrl,
        { image: imageBase64 },
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data || response.data.length === 0) {
        throw new Error('Empty response from API');
      }

      // Send back image with background removed
      await sock.sendMessage(
        m.from,
        {
          image: Buffer.from(response.data),
          caption: '✅ Background removed successfully!',
          mentions: [m.sender],
        },
        { quoted: m }
      );

      // React with success emoji
      await sock.sendMessage(m.from, { react: { text: '✅', key: m.key } });
    } catch (error) {
      console.error('Error in rmbg command:', error);
      await sock.sendMessage(
        m.from,
        { text: `❌ Error: ${error.message || error}` },
        { quoted: m }
      );
      await sock.sendMessage(m.from, { react: { text: '❌', key: m.key } });
    }
  }
};

export default rmbg;
