// Sarkar-MD AutoBio System
import config from '../../config.cjs';

const quotes = [
  "Stay focused and never give up!",
  "Success comes to those who work for it.",
  "Every moment is a fresh beginning.",
  "Dream big, work hard, stay humble.",
  "Your only limit is your mind.",
  "Believe in yourself and all that you are.",
  "Great things take time, keep pushing forward.",
  "Hustle until your haters ask if you're hiring.",
  "Don't stop until you're proud.",
  "Opportunities don't happen, you create them."
];

const updateBio = async (sock) => {
  if (!config.AUTO_BIO) return;

  setInterval(async () => {
    const uptime = process.uptime();
    const realdate = new Date().toLocaleDateString('en-GB');
    const realtime = new Date().toLocaleTimeString('en-GB');
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    const bio = `Sarkar-MD is Active From ${Math.floor(uptime)}s | RealDate: ${realdate} | RealTime: ${realtime} | Quote: ${quote}`;

    try {
      await sock.updateProfileStatus(bio);
      console.log("Bio updated successfully:", bio);
    } catch (err) {
      console.error("Failed to update bio:", err);
    }
  }, 60000); // Updates every 1 minute
};

export default updateBio;
