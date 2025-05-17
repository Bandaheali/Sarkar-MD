import fs from 'fs';
import config from '../../config.js';

// For tracking auto-bio interval
const intervals = {}; 

const startTime = Date.now(); // Store bot start time

// Function to get real-time formatted date (Pakistan Time Zone)
const getRealDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Karachi',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Function to get real-time formatted time (Pakistan Time Zone)
const getRealTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

// Function to calculate uptime accurately
const getUptime = () => {
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
};

// Function to get random quote from API
const getRandomQuote = async () => {
    try {
        const response = await fetch("https://bandaheali.site/api/quote");
        const data = await response.json();
        if (data.success && data.quote) {
            const { lines, author } = data.quote;
            return `"${lines}" - ${author}`;
        } else {
            return "No quote available.";
        }
    } catch (error) {
        console.error("Error fetching quote:", error);
        return "Quote fetch error.";
    }
};

// Function to update Bio with real-time date, time, uptime, and quote
const updateBio = async (Matrix) => {
    const currentDate = getRealDate();
    const currentTime = getRealTime();
    const uptime = getUptime();
    const quote = await getRandomQuote();

    const newBio = `Sarkar-MD Active | ${currentDate} | ${currentTime} | Uptime: ${uptime} | Quote: ${quote}`;

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
