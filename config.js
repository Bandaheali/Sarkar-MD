import dotenv from 'dotenv';
import { getSetting } from './lib/settings.js';

dotenv.config();

const toBool = (x, defaultVal = false) => {
  if (typeof x === 'boolean') return x;
  if (typeof x === 'string') return x.toLowerCase() === 'true';
  return defaultVal;
};

const config = {
  SESSION_ID: process.env.SESSION_ID || "Sarkarmd$eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiMEJBNmFwYXdFUkFZNktGaGkxZkdVWDZXcHlmVzBIdldzRWt3ZVdXN1EyOD0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiSzdhNE00ZHQwQ3k5eW9XSmlaL0tnRlhkMUdnbm5NT21wRUluYjdrWlpDUT0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJRR2phWlk5b0ZvVDFiODZ6UlY0bExVNGlidU55M1h4d21pVEJQVjdaT1Z3PSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJ1LzFFRHFIT3g1eHllb3VUakRLRGEvTVVURDErSjFjYitLRVdyZ2F4MTJZPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkFNZFhkU1liaTY1RktLWVJBOUVkUDRsakZZWDlqSlRnUm1SYzRFRE1YSEk9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImZndlUzWUpzUlZXVEVrQS9HL1BRWmcraVYveExhcDFQUG1rU2ZVYjVIVGc9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiZVBGNHM5TnNKck1FRG1YM3ZpTmYxNVVJbmVCdVZhdkxXZW9RUUhDREltVT0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoielVML1RRVkdBWEdRQk9veEpaZ3l4cUY4cUdTbWhyWHlSWE9CNVVaWHUwcz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImNWUDB5VzliRTFFQkxoVFZHUzVxRzNwSGhCeXMwTTFIWmFIQk5Vd3ZhUm9DVHRVc1VoVXRzYmxBS0gyVlFQR3FrWEwvT0hBNTFxclZTMlkxQUF3UWlBPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MTQ4LCJhZHZTZWNyZXRLZXkiOiJ5ZGkzUnp4eGZPTGQzRUhrYU5UL2NReEFkOHhHM3phaTJYcG9BV29tZmJnPSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W10sIm5leHRQcmVLZXlJZCI6MzEsImZpcnN0VW51cGxvYWRlZFByZUtleUlkIjozMSwiYWNjb3VudFN5bmNDb3VudGVyIjowLCJhY2NvdW50U2V0dGluZ3MiOnsidW5hcmNoaXZlQ2hhdHMiOmZhbHNlfSwicmVnaXN0ZXJlZCI6dHJ1ZSwicGFpcmluZ0NvZGUiOiIxMjNMT1RVUyIsIm1lIjp7ImlkIjoiMjYwOTY0MTIyNDExOjIyQHMud2hhdHNhcHAubmV0IiwibGlkIjoiMTgyODI0MDc0MjU2NDQ0OjIyQGxpZCJ9LCJhY2NvdW50Ijp7ImRldGFpbHMiOiJDTnI0N2JzQkVLU0w5OEVHR0FRZ0FDZ0EiLCJhY2NvdW50U2lnbmF0dXJlS2V5IjoiQXl5ZUh3cDJUbHZ2a3FqRGZlVzVaNEZPU0NzdmhRa0s5WjduNVJIS3MyRT0iLCJhY2NvdW50U2lnbmF0dXJlIjoiV0pNZXYwYm9xSTJVYVNUNHFBbEcwNHMxZ3pUN0RDenBWUFZ1ZG1BWXRDTG80azJQcE9ZM0g1Qi9qT0NNV1ZXZmM5MWh1NWxVNU10bzVXUVpCL2FnQ0E9PSIsImRldmljZVNpZ25hdHVyZSI6IkRHeWJoeWtUdWhGcE1hdVg5NFZGY1QrOTlZZ25CZG9NQnZxOXZJQXFpWURVYTFHOHVGaTJPQTBZUGQ4NkhwakkvZldia0JsWlFjQ2ZKVE5jZHBKVWlBPT0ifSwic2lnbmFsSWRlbnRpdGllcyI6W3siaWRlbnRpZmllciI6eyJuYW1lIjoiMjYwOTY0MTIyNDExOjIyQHMud2hhdHNhcHAubmV0IiwiZGV2aWNlSWQiOjB9LCJpZGVudGlmaWVyS2V5Ijp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQlFNc25oOEtkazViNzVLb3czM2x1V2VCVGtnckw0VUpDdldlNStVUnlyTmgifX1dLCJwbGF0Zm9ybSI6ImFuZHJvaWQiLCJyb3V0aW5nSW5mbyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkNBVUlBZz09In0sImxhc3RBY2NvdW50U3luY1RpbWVzdGFtcCI6MTc0ODg3ODc1OCwibGFzdFByb3BIYXNoIjoibm0zQmIiLCJteUFwcFN0YXRlS2V5SWQiOiJBQUFBQUNOLyJ9",

  PREFIX: getSetting('prefix') || process.env.PREFIX || '.',

  OWNER_NUMBER: getSetting('ownernumber') || process.env.OWNER_NUMBER || '923253617422',

  OWNER_NAME: getSetting('ownerName') || process.env.OWNER_NAME || "©Bandaheali",

  WELCOME: toBool(getSetting('welcome') || process.env.WELCOME),
  CHAT_BOT: toBool(getSetting('chatbot') || process.env.CHAT_BOT),
  VOICE_BOT: toBool(getSetting('voicebot') || process.env.VOICE_BOT),
  ANTI_DELETE: toBool(getSetting('antidelete') || process.env.ANTI_DELETE),
  DELETE_PATH: getSetting('deletepath') || process.env.DELETE_PATH || "same",
  AUTO_REACT: toBool(getSetting('autoreact') || process.env.AUTO_REACT),
  HEART_REACT: toBool(getSetting('heartreact') || process.env.HEART_REACT),
  AUTO_TYPING: toBool(getSetting('typing') || process.env.AUTO_TYPING),
  AUTO_RECORDING: toBool(getSetting('recording') || process.env.AUTO_RECORDING),
  ALWAYS_ONLINE: toBool(getSetting('alwaysonline') || process.env.ALWAYS_ONLINE),
  AUTO_BIO: toBool(getSetting('autobio') || process.env.AUTO_BIO),
  AUTO_STATUS_SEEN: toBool(getSetting('statusView') || process.env.AUTO_STATUS_SEEN, true),
  PM_BLOCK: toBool(getSetting('pmblock') || process.env.PM_BLOCK),
  REJECT_CALL: toBool(getSetting('antiCall') || process.env.REJECT_CALL),
  MODE: getSetting('mode') || process.env.MODE || 'public',
  MENU_IMAGE: getSetting('menuimage') || process.env.MENU_IMAGE || 'https://files.catbox.moe/yd6y5b.jpg',
  BOT_NAME: getSetting('botname') || process.env.BOT_NAME || "Sarkar-MD",
  CALL_MSG: getSetting('callmsg') || process.env.CALL_MSG || "Hey there!*\n\nSorry to inform you, but *Anti-Call protection* is currently active on this number. That’s why your call was automatically disconnected.\n\nPlease don’t take it the wrong way — calling is disabled to avoid disturbance. If there’s something important, kindly *drop your message here* and we’ll get back to you as soon as possible.\n\nThanks for your understanding!\n"
};

export default config;
