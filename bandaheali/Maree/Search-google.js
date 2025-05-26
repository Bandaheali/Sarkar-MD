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
                "🔍 *Google Search*\n\nUsage: `.google [search query]`\nExample: `.google ChatGPT updates`\n\nGet top Google search results",
                m,
                "🌐 Google Command",
                "Query Required"
            );
            return;
        }

        // Show processing
        await sock.sendPresenceUpdate('composing', m.from);
        await m.React('⏳');

        // Set proper headers to mimic a browser
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        };

        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=us&hl=en`;
        
        const response = await axios.get(searchUrl, { headers });
        const $ = cheerio.load(response.data);

        // New method to parse Google's current HTML structure
        const results = [];
        
        // Main organic results
        $('div.g').each((i, el) => {
            if (i >= 5) return false; // Limit to 5 results
            
            const title = $(el).find('h3').text();
            const urlElement = $(el).find('a[href^="/url?"]');
            const url = urlElement.attr('href') ? 
                new URLSearchParams(urlElement.attr('href').split('?')[1]).get('q') : 
                null;
            const snippet = $(el).find('div[data-sncf]').text() || $(el).find('.VwiC3b').text();
            
            if (title && url) {
                results.push({
                    title,
                    url,
                    description: snippet.replace(/\s+/g, ' ').trim()
                });
            }
        });

        // Alternative parsing if first method didn't work
        if (results.length === 0) {
            $('a[href^="/url?"]').each((i, el) => {
                if (i >= 10) return false; // Safety limit
                
                const title = $(el).find('h3').text();
                const url = new URLSearchParams($(el).attr('href').split('?')[1]).get('q');
                const parentDiv = $(el).closest('div');
                const snippet = parentDiv.find('div[data-sncf]').text() || parentDiv.find('.VwiC3b').text();
                
                if (title && url && !url.startsWith('https://www.google.com/')) {
                    results.push({
                        title,
                        url,
                        description: snippet.replace(/\s+/g, ' ').trim()
                    });
                }
            });
        }

        if (results.length === 0) {
            throw new Error("No results found - Google may have blocked the request");
        }

        // Format results
        let resultMessage = `🔍 *Google Results for "${query}"*\n\n`;
        results.slice(0, 5).forEach((result, index) => {
            resultMessage += `*${index + 1}. ${result.title}*\n`;
            resultMessage += `🔗 ${result.url}\n`;
            if (result.description) {
                resultMessage += `📝 ${result.description}\n\n`;
            } else {
                resultMessage += `\n`;
            }
        });

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
            "❌ *Google Search Failed*\n\nPossible reasons:\n• Google blocked the request\n• No results found\n• Try different keywords\n• Temporary service issue\n\nTry again in a few minutes",
            m,
            "🌐 Google Error",
            "Try Again"
        );
        await m.React('❌');
    }
};

export default google;
