import axios from 'axios';
import config from '../../config.js';
import FormData from 'form-data';

const removebg = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (cmd !== "removebg" && cmd !== "rmbg") return;

    try {
        if (!m.quoted || m.quoted.mtype !== 'imageMessage') {
            return sock.sendMessage(m.from, {
                text: "⚠️ Please *reply to an image* with `removebg` or `rmbg`"
            }, { quoted: m });
        }

        // Step 1: Download Image Buffer
        const mediaBuffer = await sock.downloadMediaMessage(m.quoted);

        // Step 2: Upload to Catbox (or any image host)
        const uploadToCatbox = async (buffer) => {
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', buffer, 'image.jpg');

            const res = await axios.post("https://catbox.moe/user/api.php", form, {
                headers: form.getHeaders()
            });

            return res.data.trim(); // Direct image URL
        };

        const imageUrl = await uploadToCatbox(mediaBuffer);

        // Step 3: Create RemoveBG API URL
        const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}&scale=2`;

        // Step 4: Get Image Back (API returns image directly)
        const result = await axios.get(apiUrl, {
            responseType: 'arraybuffer'
        });

        // Step 5: Send Image To User
        await sock.sendMessage(m.from, {
            image: Buffer.from(result.data),
            caption: "✅ Background removed!"
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        await sock.sendMessage(m.from, {
            text: "❌ Failed to remove background. Try again."
        }, { quoted: m });
    }
};

export default removebg;
