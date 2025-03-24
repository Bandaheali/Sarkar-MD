import fetch from 'node-fetch';
import config from '../../config.cjs';

const chatbotCommand = async (m, Matrix) => {
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || null; // Extract text
    const senderId = m.key.remoteJid; // Full sender ID (including @s.whatsapp.net)

    // Ignore all messages from the bot owner
    const ownerNumber = `${config.OWNER_NUMBER}@s.whatsapp.net`; // Full ID for owner number
    if (senderId === ownerNumber) {
        console.log('Owner message ignored.');
        return;
    }

    // Ignore group, broadcast, and newsletter messages
    if (senderId.endsWith('@g.us') || senderId === 'status@broadcast' || senderId.includes('@newsletter')) {
        console.log('Group, broadcast, or newsletter message ignored.');
        return;
    }

    // If no message text, return
    if (!text) {
        console.log('No valid message found to process.');
        return;
    }

    // Add a prompt for human-like behavior
    const userMessage = text.trim();
    const promptMessage = userMessage.toLowerCase() === 'tumhara naam kya hai' ? 'Mera Naam hai Sarkar-md hai.' : 
                         userMessage.toLowerCase() === 'kisne bnaya hai' ? 'Mujhe Bandaheali ne banaya hai.' : 
                         userMessage;

    // Make the API call to the chatbot service
    try {
        const response = await fetch(`https://apis.giftedtech.web.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(promptMessage)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData.success) {
            let botReply = responseData.result || 'Sorry, I couldn\'t understand that.';
            const formattedReply = `🤖 Response: ${botReply}`;

            // Send the AI response to the user
            await Matrix.sendMessage(senderId, { text: formattedReply }, { quoted: m });
        } else {
            await Matrix.sendMessage(senderId, { text: '❌ Failed to fetch response from the server. Please try again later.' }, { quoted: m });
        }

    } catch (err) {
        console.error('Error fetching AI response:', err.message);
        await Matrix.sendMessage(senderId, { text: '❌ Failed to fetch response from the server. Please try again later.' }, { quoted: m });
    }
};

export default chatbotCommand;
