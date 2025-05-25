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

      // Step 1: Download image
      const media = await m.quoted.download();
      if (!media) throw new Error('Media download failed');

      // Step 2: Upload to Telegra.ph
      const form = new FormData();
      form.append('file', media, { filename: 'image.png', contentType: 'image/png' });

      const uploadRes = await axios.post('https://telegra.ph/upload', form, {
        headers: form.getHeaders(),
      });

      const imageUrl = 'https://telegra.ph' + uploadRes.data[0].src;

      // Step 3: Call background remove API with image URL
      const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}`;

      const result = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
      });

      if (!result.data || result.data.length === 0) {
        throw new Error('Empty response from background removal API');
      }

      // Step 4: Send final image back
      await sock.sendMessage(
        m.from,
        {
          image: Buffer.from(result.data),
          caption: '✅ Background removed successfully!',
          mentions: [m.sender],
        },
        { quoted: m }
      );

      await sock.sendMessage(m.from, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('❌ Error:', err.message || err);
      await sock.sendMessage(m.from, {
        text: `❌ Error: ${err.response?.data?.message || err.message}`,
      }, { quoted: m });
      await sock.sendMessage(m.from, { react: { text: '❌', key: m.key } });
    }
  }
};

export default rmbg;
