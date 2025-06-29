import dotenv from 'dotenv';
import { getSetting } from './lib/settings.js';

dotenv.config();

const toBool = (x, defaultVal = false) => {
  if (typeof x === 'boolean') return x;
  if (typeof x === 'string') return x.toLowerCase() === 'true';
  return defaultVal;
};

const config = {
  SESSION_ID: process.env.SESSION_ID || "",

  PREFIX: getSetting('prefix') || process.env.PREFIX || '.',

  OWNER_NUMBER: getSetting('ownernumber') || process.env.OWNER_NUMBER || '923253617422',

  OWNER_NAME: getSetting('ownerName') || process.env.OWNER_NAME || "©Bandaheali",

  WELCOME: toBool(getSetting('welcome') || process.env.WELCOME),
  CHAT_BOT: toBool(getSetting('chatbot') || process.env.CHAT_BOT),
  VOICE_BOT: toBool(getSetting('voicebot') || process.env.VOICE_BOT),
  ANTI_DELETE: toBool(getSetting('antidelete') || process.env.ANTI_DELETE),
  DELETE_PATH: getSetting('deletepath') || process.env.DELETE_PATH || "pm",
  AUTO_REACT: toBool(getSetting('autoreact') || process.env.AUTO_REACT),
  HEART_REACT: toBool(getSetting('heartreact') || process.env.HEART_REACT),
  AUTO_TYPING: toBool(getSetting('typing') || process.env.AUTO_TYPING),
  AUTO_RECORDING: toBool(getSetting('recording') || process.env.AUTO_RECORDING),
  ALWAYS_ONLINE: toBool(getSetting('alwaysonline') || process.env.ALWAYS_ONLINE),
  AUTO_BIO: toBool(getSetting('autobio') || process.env.AUTO_BIO, false),
  AUTO_STATUS_SEEN: toBool(getSetting('statusview') || process.env.AUTO_STATUS_SEEN, true),
  AUTO_STATUS_REACT: toBool(getSetting('statusreact') || process.env.AUTO_STATUS_REACT, false),
  PM_BLOCK: toBool(getSetting('pmblock') || process.env.PM_BLOCK),
  REJECT_CALL: toBool(getSetting('anticall') || process.env.REJECT_CALL),
  MODE: getSetting('mode') || process.env.MODE || 'public',
  MENU_IMAGE: getSetting('menuimage') || process.env.MENU_IMAGE || 'https://files.catbox.moe/yd6y5b.jpg',
  BOT_NAME: getSetting('botname') || process.env.BOT_NAME || "Sarkar-MD",
  CALL_MSG: getSetting('callmsg') || process.env.CALL_MSG || "_Soory For rejecting The Call i Am Busy Right Now drop Your Msg Here_"
};

export default config;
