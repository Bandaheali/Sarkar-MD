import fetch from 'node-fetch';
import config from '../../config.js';

const fetchData = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['fetch', 'get', 'api'];

  if (!validCommands.includes(cmd)) return;

  if (!text) return m.reply('Please provide a URL after the command.');
  if (!/^https?:\/\//i.test(text)) return m.reply('URL must start with http:// or https://');

  try {
    let url;
    try {
      // Properly construct the URL
      const _url = new URL(text);
      url = _url.toString();
    } catch (e) {
      return m.reply('Invalid URL format. Please provide a valid URL.');
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10 seconds timeout
    });

    if (!res.ok) {
      return m.reply(`Request failed with status ${res.status} ${res.statusText}`);
    }

    // Check content length (100MB limit)
    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) {
      return m.reply(`File is too large (${Math.round(parseInt(contentLength) / (1024 * 1024)}MB). Maximum allowed is 100MB.`);
    }

    const contentType = res.headers.get('content-type') || '';

    // Handle non-text content (images, videos, etc.)
    if (!contentType.match(/text|json|xml|javascript|html/)) {
      try {
        await Matrix.sendMedia(m.from, url, 'file', `> API Fetched From ${config.NAME}\nURL: ${url}`, m);
        return;
      } catch (mediaError) {
        console.error('Media send error:', mediaError);
        return m.reply('Received binary content but failed to send it as media.');
      }
    }

    // Process text content
    let content;
    try {
      content = await res.text();
      
      // Try to parse if it's JSON
      if (contentType.includes('json') || (content.startsWith('{') || content.startsWith('['))) {
        try {
          const jsonData = JSON.parse(content);
          content = JSON.stringify(jsonData, null, 2); // Pretty print JSON
        } catch (e) {
          // Not valid JSON, keep original content
        }
      }
    } catch (readError) {
      console.error('Error reading response:', readError);
      return m.reply('Failed to read the response from the URL.');
    }

    // Handle large text responses
    const MAX_LENGTH = 65536; // WhatsApp message limit
    if (content.length > MAX_LENGTH) {
      // For very large responses, consider sending as a file
      try {
        await Matrix.sendFile(m.from, Buffer.from(content), 'response.txt', `> Large response from ${url}`, m);
        return m.reply('Response was too large, sent as a file.');
      } catch (fileError) {
        console.error('File send error:', fileError);
        return m.reply(`First ${MAX_LENGTH} characters:\n${content.slice(0, MAX_LENGTH)}`);
      }
    }

    // Send the processed content
    return m.reply(content);

  } catch (error) {
    console.error('Fetch error:', error);
    return m.reply(`Failed to fetch data: ${error.message}`);
  }
};

export default fetchData;