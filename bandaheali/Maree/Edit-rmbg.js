import axios from 'axios';
import config from '../../config.js';

const rmbg = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === 'rmbg') {
    try {
      // Check if message is a reply and has an image
      if (!m.quoted) {
        return sock.sendMessage(m.from, { text: '❌ Please reply to an image with *.rmbg* to remove its background' }, { quoted: m });
      }

      // Check for image in different ways
      const isImage = m.quoted.mimetype?.includes('image') || 
                     m.quoted.message?.imageMessage || 
                     m.quoted?.type === 'image';

      if (!isImage) {
        return sock.sendMessage(m.from, { text: '❌ The replied message is not an image. Please reply to an image.' }, { quoted: m });
      }

      await m.React('⏳'); // React with loading icon

      // Download the image
      const media = await sock.downloadMediaMessage(m.quoted);
      const imageBase64 = media.toString('base64');

      // Call the removebg API
      const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageBase64)}`;
      
      const response = await axios.post(apiUrl, {}, {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('Empty response from API');
      }

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
      await sock.sendMessage(m.from, { text: `❌ Error: ${error}` }, { quoted: m });
      await m.React('❌'); // React with error icon
    }
  }
};

export default rmbg;
