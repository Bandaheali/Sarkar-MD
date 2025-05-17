import axios from 'axios';
import cheerio from 'cheerio';
import config from '../../config.js';

const tiktokHandler = async (m, sock) => {
  try {
    const prefix = config.PREFIX || '!';
    const body = m.body || '';
    if (!body.startsWith(prefix)) return;

    const cmd = body.slice(prefix.length).split(' ')[0].toLowerCase();
    const text = body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'mix') {
      if (!text || !text.includes('tiktok.com')) {
        await sock.sendMessage(m.from, { text: '❌ Please provide a valid TikTok URL.' }, { quoted: m });
        await m.React('❌');
        return;
      }

      await m.React('⏳');

      const fetchUrl = `https://snaptik.app/`; // Website that allows TikTok video download

      // Send initial request to get the download form
      const { data: html } = await axios.get(fetchUrl);
      const $ = cheerio.load(html);
      const token = $('input[name="token"]').attr('value');

      // Submit the form to get download links
      const res = await axios.post(`${fetchUrl}abc.php`, new URLSearchParams({
        url: text,
        token
      }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': fetchUrl
        }
      });

      const $res = cheerio.load(res.data);
      const videoUrl = $res('.download a').attr('href');

      if (!videoUrl) {
        await sock.sendMessage(m.from, { text: '❌ Failed to fetch TikTok video. Try a different link.' }, { quoted: m });
        await m.React('❌');
        return;
      }

      await sock.sendMessage(m.from, {
        video: { url: videoUrl },
        caption: `🎵 TikTok Video\n\nDownloaded using SnapTik\n\nPOWERED BY BANDAHEALI`
      }, { quoted: m });

      await m.React('✅');
    }

  } catch (error) {
    console.error('TikTok Handler Error:', error);
    await sock.sendMessage(m.from, { text: '❌ Error downloading TikTok video.' }, { quoted: m });
    await m.React('❌');
  }
};

export default tiktokHandler;
