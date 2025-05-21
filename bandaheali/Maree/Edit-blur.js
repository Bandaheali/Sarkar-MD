
import FormData from 'form-data';
import axios from 'axios';
import config from '../../config.js';

const removebg = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    if (cmd !== "removebg" && cmd !== "rmbg") return;

    try {
        if (!m.quoted || m.quoted.mtype !== 'imageMessage') {
            return sock.sendMessage(m.from, {
                text: "⚠️ *Please reply to an image with the command* `removebg` or `rmbg`."
            }, { quoted: m });
        }

        // Get media buffer
        const mediaBuffer = await sock.downloadMediaMessage(m.quoted);

        // Upload to an image hosting service (placeholder, you may replace this)
        const uploadImage = async (buffer) => {
            const form = new FormData();
            form.append('file', buffer, { filename: 'image.jpg' });

            const res = await axios.post("https://telegra.ph/upload", form, {
                headers: form.getHeaders()
            });

            return "https://telegra.ph" + res.data[0].src;
        };

        const imageUrl = await uploadImage(mediaBuffer);

        // Remove background API
        const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}&scale=2`;

        // Fetch the image directly from API
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer'
        });

        // Send the processed image to user
        await sock.sendMessage(m.from, {
            image: Buffer.from(response.data),
            caption: "✅ Background removed successfully!"
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        await sock.sendMessage(m.from, {
            text: "❌ Failed to remove background. Please try again."
        }, { quoted: m });
    }
};

export default removebg;
