import fs from 'fs';
import config from '../../config.cjs';

// For tracking auto-bio interval
const intervals = {}; 

const startTime = Date.now(); // Store bot start time

// Function to get real-time formatted date (Pakistan Time Zone)
const getRealDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi', year: 'numeric', month: 'long', day: 'numeric' });
};

// Function to get real-time formatted time (Pakistan Time Zone)
const getRealTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hour12: true });
};

// Function to calculate uptime accurately
const getUptime = () => {
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
};

// Function to get a random quote
const getRandomQuote = () => {
    const randomQuotes = [
        "The best way to predict the future is to create it.",
        "Success is not final, failure is not fatal.",
        "Believe you can and you're halfway there.",
        "Hardships prepare people for an extraordinary destiny.",
        "Your time is limited, don't waste it.",
        "The only way to do great work is to love what you do.",
        "Success usually comes to those who are too busy to look for it.",
        "The only limit to our realization of tomorrow is our doubts of today.",
        "It always seems impossible until it’s done."
    ];
    return randomQuotes[Math.floor(Math.random() * randomQuotes.length)];
};

// Function to update Bio with real-time date, time, uptime, and quote
const updateBio = async (Matrix) => {
    const currentDate = getRealDate();  // Get real-time date
    const currentTime = getRealTime();  // Get real-time time
    const uptime = getUptime();         // Calculate uptime
    const randomQuote = getRandomQuote(); 

    const newBio = `Sarkar-MD Active | ${currentDate} | ${currentTime} | Uptime: ${uptime} | Quote: "${randomQuote}"`;

    try {
        await Matrix.updateProfileStatus(newBio);
        console.log("Bio updated successfully:", newBio);
    } catch (error) {
        console.error("Failed to update bio:", error);
    }
};

// Command function to enable/disable Auto Bio
const autobioCommand = async (m, Matrix) => {
    if (config.AUTO_BIO) {
        if (!intervals['autobio']) {
            intervals['autobio'] = setInterval(() => updateBio(Matrix), 60000); // Update every 1 min
            console.log("Auto-Bio updates enabled.");
        }
    } else {
        if (intervals['autobio']) {
            clearInterval(intervals['autobio']);
            delete intervals['autobio'];
            console.log("Auto-Bio updates disabled.");
        }
    }
};

export default autobioCommand;
