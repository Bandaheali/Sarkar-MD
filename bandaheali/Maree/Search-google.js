import axios from 'axios';
import cheerio from 'cheerio';
import config from '../../config.js';
import { sendNewsletter } from '../Sarkar/newsletter.js';

const google = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== "google") return;

    try {
        if (!query) {
            await sendNewsletter(
                sock,
                m.from,
                "🔍 *Google Search*\n\nUsage: `.google [search query]`\nExample: `.google latest AI developments`\n\nGet top 5 Google search results directly in WhatsApp",
                m,
                "🌐 Google Command",
                "Query Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Fetch Google search results
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        const response = await axios.get(searchUrl, { headers });
        const $ = cheerio.load(response.data);

        // Extract search results
        const results = [];
        $('div.g').each((i, el) => {
            if (i >= 5) return; // Limit to 5 results
            
            const title = $(el).find('h3').text();
            const url = $(el).find('a').attr('href');
            const description = $(el).find('div.IsZvec').text() || $(el).find('.VwiC3b').text();
            
            if (title && url && description) {
                results.push({
                    title,
                    url: url.startsWith('/url?q=') ? 
                        decodeURIComponent(url.split('/url?q=')[1].split('&')[0]) : 
                        url,
                    description: description.replace(/\s+/g, ' ').trim()
                });
            }
        });

        if (results.length === 0) {
            throw new Error("No results found");
        }

        // Format results message
        let resultMessage = `🔍 *Google Search Results for "${query}"*\n\n`;
        results.forEach((result, index) => {
            resultMessage += `*${index + 1}. ${result.title}*\n`;
            resultMessage += `🌐 ${result.url}\n`;
            resultMessage += `📝 ${result.description}\n\n`;
        });

        resultMessage += `\nℹ️ Total results: ${results.length}`;

        // Send results
        await sock.sendMessage(
            m.from,
            { text: resultMessage },
            { quoted: m }
        );

        await m.React('✅');

    } catch (error) {
        console.error("Google Search Error:", error);
        await sendNewsletter(
            sock,
            m.from,
            "❌ *Google Search Failed*\n\n• No results found\n• Try different keywords\n• Google might be blocking requests\n\nTry again later or refine your search",
            m,
            "🌐 Google Error",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default google;
