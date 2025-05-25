import axios from 'axios';
import config from '../../config.js';

const rmbg = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === 'rmbg') {
    try {
      // Check if message has an image
      if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.includes('image')) {
        return sock.sendMessage(m.from, { text: '❌ Please reply to an image with *.rmbg* to remove its background' }, { quoted: m });
      }

      await m.React('⏳'); // React with loading icon

      // Download the image
      const media = await sock.downloadMediaMessage(m.quoted);
      const imageBase64 = media.toString('base64');

      // Call the removebg API
      const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageBase64)}`;
      
      const response = await axios.post(apiUrl, {}, {
        responseType: 'arraybuffer'
      });

      // Send the result back
      await sock.sendMessage(
        m.from,
        {
          image: Buffer.from(response.data),
          caption: '✅ Background removed successfully!',
          mentions: [m.sender]
        },
        { quoted: m }
      );

      await m.React('✅'); // React with success icon
    } catch (error) {
      console.error('Error in rmbg command:', error);
      await sock.sendMessage(m.from, { text: '❌ Failed to remove background. Please try again later.' }, { quoted: m });
      await m.React('❌'); // React with error icon
    }
  }
};

export default rmbg;
