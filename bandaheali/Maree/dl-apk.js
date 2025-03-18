import axios from "axios";
import config from "../../config.cjs";

const whatsappApk = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "apk") {
    if (!text) {
      return sock.sendMessage(m.from, {
        text: "*❌ Please provide an APK link.*\n\n📌 *Example:* .apk whatsapp",
      }, { quoted: m });
    }

    const api = `https://apis.giftedtech.web.id/api/download/aptoide?apikey=gifted&query=${encodeURIComponent(text)}`;

    // Fetching message send karo
    const loadingMsg = await sock.sendMessage(m.from, {
      text: "🔄 *Fetching APK...*",
    }, { quoted: m });

    try {
      console.log("🔍 Fetching from API:", api); // Debugging Log

      const response = await axios.get(api);
      console.log("✅ API Response:", response.data); // Full Response Debug

      if (!response.data.success) {
        await sock.sendMessage(m.from, {
          text: "*❌ Failed to retrieve the APK. The API may be down or the app name is incorrect.*",
        }, { quoted: m });
        return;
      }

      const { appname, appicon, developer, download_url, mimetype } = response.data.result;

      if (!download_url) {
        await sock.sendMessage(m.from, {
          text: "*❌ No download link found. The API may be broken.*",
        }, { quoted: m });
        return;
      }

      // Fetching message delete karo
      await sock.sendMessage(m.from, { delete: loadingMsg.key });

      // Send APK Information
      await sock.sendMessage(m.from, {
        image: { url: appicon },
        caption: `📱 *App Name:* ${appname}\n👨‍💻 *Developer:* ${developer}\n📥 *Downloading...*\n\n> *Powered by Sarkar-MD*`,
      }, { quoted: m });

      // Send APK File
      await sock.sendMessage(m.from, {
        document: { url: download_url },
        mimetype: mimetype,
        fileName: `${appname}.apk`,
        caption: `✅ *${appname} APK Successfully Downloaded!*`,
      }, { quoted: m });

    } catch (error) {
      console.error("❌ APK API Error:", error.response ? error.response.data : error.message);

      await sock.sendMessage(m.from, {
        text: "*❌ An error occurred while processing your request. Please try again later.*",
      }, { quoted: m });
    }
  }
};

export default whatsappApk;
