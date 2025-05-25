import axios from 'axios';
import FormData from 'form-data';
import config from '../../config.js';

const rmbg = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === 'rmbg') {
    try {
      if (!m.quoted) {
        return sock.sendMessage(m.from, {
          text: '❌ Please reply to an image with *.rmbg* to remove its background',
        }, { quoted: m });
      }

      const isImage =
        m.quoted.mimetype?.includes('image') ||
        m.quoted.message?.imageMessage ||
        m.quoted?.type === 'image';

      if (!isImage) {
        return sock.sendMessage(m.from, {
          text: '❌ The replied message is not an image.',
        }, { quoted: m });
      }

      await sock.sendMessage(m.from, { react: { text: '⏳', key: m.key } });

      // Download image
      const media = await m.quoted.download();
      if (!media) throw new Error('Media download failed');

      // Upload to file.io
      const form = new FormData();
      form.append('file', media, { filename: 'image.png', contentType: 'image/png' });

      const uploadRes = await axios.post('https://file.io/', form, {
        headers: form.getHeaders(),
      });

      const imageUrl = uploadRes.data.link;
      if (!imageUrl) throw new Error('Image upload failed');

      // Now call the API with image URL
      const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}`;

      const bgRemoved = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
      });

      if (!bgRemoved.data || bgRemoved.data.length === 0) {
        throw new Error('Background removal failed');
      }

      // Send back to user
      await sock.sendMessage(
        m.from,
        {
          image: Buffer.from(bgRemoved.data),
          caption: '✅ Background removed successfully!',
          mentions: [m.sender],
        },
        { quoted: m }
      );

      await sock.sendMessage(m.from, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('Error:', err.message || err);
      await sock.sendMessage(m.from, {
        text: `❌ Error: ${err.response?.data?.message || err.message}`,
      }, { quoted: m });
      await sock.sendMessage(m.from, { react: { text: '❌', key: m.key } });
    }
  }
};

export default rmbg;
