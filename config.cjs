const dotenv = require('dotenv');
const fs = require('fs');
const  { getSetting } = require('./lib/settings.js');

dotenv.config();

const config = {
  SESSION_ID: process.env.SESSION_ID || "",

  PREFIX:
    getSetting('prefix') ||
    process.env.PREFIX ||
    '.', // default fallback

  OWNER_NUMBER:
    getSetting('owner_number') ||
    process.env.OWNER_NUMBER ||
    '923253617422', // default fallback

  OWNER_NAME: getSetting('ownerName') || process.env.OWNER_NAME || "©Bandaheali",

  WELCOME: getSetting('welcome') || process.env.WELCOME || false,
  
  CHAT_BOT: getSetting('chatbot') || process.env.CHAT_BOT || false,
  
  VOICE_BOT: getSetting('voicebot') || process.env.VOICE_BOT || false,
  
  ANTI_DELETE: getSetting('antidelete') || process.env.ANTI_DELETE || false,
  
 DELETE_PATH: getSetting('deletepath') || process.env.DELETE_PATH || "same",
 
AUTO_REACT: getSetting('autoreact') || process.env.AUTO_REACT || false,

AUTO_TYPING: getSetting('typing') || process.env.AUTO_TYPING || false,

AUTO_RECORDING: getSetting('recoding') || process.env.AUTO_RECORDING || false,

ALWAYS_ONLINE: getSetting('alwaysonline') || process.env.ALWAYS_ONLINE || false,

AUTO_BIO: getSetting('autobio') || process.env.AUTO_BIO || false,

AUTO_STATUS_SEEN: getSetting('statusView') || process.env.AUTO_STATUS_SEEN || true,

PM_BLOCK: getSetting('pmblock') || process.env.PM_BLOCK || false,

REJECT_CALL: getSetting('rejectCall') || process.env.REJECT_CALL || false,

MODE: getSetting('mode') || process.env.MODE || 'public',


};

export default config;
