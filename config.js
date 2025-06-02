import dotenv from 'dotenv';
import { getSetting } from './lib/settings.js';

dotenv.config();

const toBool = (x, defaultVal = false) => {
  if (typeof x === 'boolean') return x;
  if (typeof x === 'string') return x.toLowerCase() === 'true';
  return defaultVal;
};

const config = {
  SESSION_ID: process.env.SESSION_ID || "Sarkarmd$eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiZ0d6OWR0bGZWSmpaSEJ6Q095bmxnMjhYUXdpTDV2V2ExaklDTzBYUGQzST0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiOEdYZzdwRTlDMGk3cGRNY1N4ZFF5d3JQNWl4bzdWT3pGTEFzQjA3Qk1Edz0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJ1SmNBNzdFa0hkcUYzNXZ1MldNQ3Qrbkova2JiWnAwRi95aUlubzc5M0hvPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJQbGJNZTI5dC92TkFZWFhyYjFWVW1tTVczTlBtSmJlY3NzQm5mWmNidjBjPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImtKZFZuY05jM3NDMlBpWXBOUXR2VkQrTGwybDBtR1M3THJzOGFGSXA5RUk9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6InRmWmIwMUtrUDRyQzZWZGI5WDdnUCtLY3RPdnVpQkdtQWpvYzQ1d2dZRlU9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoic0QvKzFaS3E0WVFCVlRabTBsMloxbWR3Z0pWTU9LdFhtR0wwNGVPalRYdz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiL3pwcUhSbXlpaTNyY2ZMYk9kcVh1REpuek9zNHVXRDBpOTJhYUZaVldCbz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjVWZlpiVnNTQ0wrbzlTNERUV2FxeEo3cGFrNUV1LzNYSDBYZXc0TVp3allVZnJUaTRlWFgyK1ozcG1jYlN6MFZrVlZkZjdzOGFUUmtoSjgyT2UwK0J3PT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MTcyLCJhZHZTZWNyZXRLZXkiOiJyU1ZuSml4RmRnUEJnSjZHd1NJNHFRTGNtS3JTcnVsYTh3UysrMEdySFVNPSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W10sIm5leHRQcmVLZXlJZCI6MzEsImZpcnN0VW51cGxvYWRlZFByZUtleUlkIjozMSwiYWNjb3VudFN5bmNDb3VudGVyIjowLCJhY2NvdW50U2V0dGluZ3MiOnsidW5hcmNoaXZlQ2hhdHMiOmZhbHNlfSwicmVnaXN0ZXJlZCI6dHJ1ZSwicGFpcmluZ0NvZGUiOiIxMjNMT1RVUyIsIm1lIjp7ImlkIjoiMjYwOTcwMDIwOTIwOjc0QHMud2hhdHNhcHAubmV0IiwibmFtZSI6ImFscGhhIGVudGVycHJpc2UiLCJsaWQiOiIyNDYwOTc0OTg4OTQ1MjQ6NzRAbGlkIn0sImFjY291bnQiOnsiZGV0YWlscyI6IkNJSDluVEVRM3YvMndRWVlBU0FBS0FBPSIsImFjY291bnRTaWduYXR1cmVLZXkiOiJtN0dFVjlzT0twODN0NitWSHAxSmtCZFd2SWZBZ1IxenFaWnNmeWFPb253PSIsImFjY291bnRTaWduYXR1cmUiOiJJL0w4YkRhVHFaVEF1WE9jRy9LbnowWkkxOENJRXBzbUQ4WDFxbm8vS1NnUHozMWl6b0g1YmNOTmNYQjBZeW5nc3hsYWd3aVc3ZkVtQlIwaVpwTDFEdz09IiwiZGV2aWNlU2lnbmF0dXJlIjoiZTIvQ2hzU1lwelE0SXcwV0ZKeWEzVjVQMitlOS9KK1I4YS83MXNCU2ZCOTMwRDRONEs5dmFrMXJsUEpZS3hxeFFPcXhxWHZOUWZqMWtlWHg0ZGdZQUE9PSJ9LCJzaWduYWxJZGVudGl0aWVzIjpbeyJpZGVudGlmaWVyIjp7Im5hbWUiOiIyNjA5NzAwMjA5MjA6NzRAcy53aGF0c2FwcC5uZXQiLCJkZXZpY2VJZCI6MH0sImlkZW50aWZpZXJLZXkiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJCWnV4aEZmYkRpcWZON2V2bFI2ZFNaQVhWcnlId0lFZGM2bVdiSDhtanFKOCJ9fV0sInBsYXRmb3JtIjoic21iYSIsInJvdXRpbmdJbmZvIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQ0EwSUFnPT0ifSwibGFzdEFjY291bnRTeW5jVGltZXN0YW1wIjoxNzQ4ODc3MjgyLCJsYXN0UHJvcEhhc2giOiIyUDFZaGYifQ==",

  PREFIX: getSetting('prefix') || process.env.PREFIX || '.',

  OWNER_NUMBER: getSetting('ownernumber') || process.env.OWNER_NUMBER || '260970020920',

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
