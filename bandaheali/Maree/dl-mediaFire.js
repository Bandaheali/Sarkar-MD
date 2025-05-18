import fetch from 'node-fetch';
import config from '../../config.js';

const mediafireCmd = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'mediafire') {
      if (!query || !query.includes('mediafire.com')) {
        return m.reply(`*❌ Please provide a valid Mediafire link!*\nExample: ${prefix}mediafire https://www.mediafire.com/file/abc/filename`);
      }

      const api = `https://www.dark-yasiya-api.site/download/mfire?url=${encodeURIComponent(query)}`;
      const res = await fetch(api);
      const json = await res.json();

      if (!json.status || !json.result || !json.result.dl_link) {
        return m.reply(`❌ Failed to fetch file. Please check the link.`);
      }

      const { dl_link, fileName, size, fileType } = json.result;

      const msg = `📁 *MEDIAFIRE DOWNLOAD*
━━━━━━━━━━━━━━━
📄 Name: *${fileName || 'Unknown'}*
📦 Size: *${size}*
📂 Type: *${fileType}*
🔗 Link: ${query}
━━━━━━━━━━━━━━━
📥 *Sending file, please wait...*`;

      await sock.sendMessage(m.from, { text: msg }, { quoted: m });

      const fileRes = await fetch(dl_link);
      const buffer = await fileRes.buffer();

      await sock.sendMessage(m.from, {
        document: buffer,
        fileName: fileName || 'file.bin',
        mimetype: fileType || 'application/octet-stream',
      }, { quoted: m });
    }
  } catch (err) {
    console.error(err);
    m.reply('*❌ Error while downloading file from Mediafire.*');
  }
};

export default mediafireCmd;
