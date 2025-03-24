import fetch from 'node-fetch';
import config from '../../config.cjs';

const chatbotCommand = async (m, Matrix) => {
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || null; // Extract text
    const senderId = m.key.remoteJid; // Full sender ID (including @s.whatsapp.net)

    // Get the owner's phone number from config
    const ownerNumber = `${config.OWNER_NUMBER}@s.whatsapp.net`; // Full ID for owner number

    // Ignore all messages from the bot owner
    if (senderId === ownerNumber) {
        console.log('Owner message detected. Ignoring.');
        return; // Ignore owner messages
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

    // Process the user message to create a query for the API
    const userMessage = text.trim();

    // If the user asks about the bot's name or creator, reply with specific answers in Urdu
    const promptMessage = userMessage.toLowerCase() === 'tumhara naam kya hai' ? 'Mera naam Sarkar-md hai.' : 
                         userMessage.toLowerCase() === 'kisne banaya hai' ? 'Mujhe Bandaheali ne banaya hai.' : 
                         userMessage;

    try {
        // Make the API call to the chatbot service
        const response = await fetch(`https://apis.giftedtech.web.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(promptMessage)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();

        // Check if the API was successful
        if (responseData.success) {
            let botReply = responseData.result || 'Mujhe samajh nahi aaya. Kya aap dobara pooch sakte hain?';
            const formattedReply = `👤 User, aapka sawaal tha: "${userMessage}"\n\nAur mera jawab hai:\n\n${botReply}`;

            // Send the response in Urdu and make it sound natural and human-like
            await Matrix.sendMessage(senderId, { text: formattedReply }, { quoted: m });
        } else {
            await Matrix.sendMessage(senderId, { text: '❌ Server se response nahi mil raha. Kripya baad mein koshish karein.' }, { quoted: m });
        }

    } catch (err) {
        console.error('Error fetching AI response:', err.message);
        await Matrix.sendMessage(senderId, { text: '❌ Server se jawab lene mein dikkat aa rahi hai. Baad mein try karein.' }, { quoted: m });
    }
};

export default chatbotCommand;
