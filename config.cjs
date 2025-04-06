// config.js
const fs = require("fs");
require("dotenv").config();

const config = {
  SESSION_ID: process.env.SESSION_ID || "",
  PREFIX: process.env.PREFIX || '.',
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
  OWNER_REACT: process.env.OWNER_REACT || "false",
  AUTO_READ: process.env.AUTO_READ || "true",
  AUTO_TYPING: process.env.AUTO_TYPING || "false",
  AUTO_RECORDING: process.env.AUTO_RECORDING || "false",
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "false",
  AUTO_REACT: process.env.AUTO_REACT || "false",
  AUTO_BIO: process.env.AUTO_BIO || "true",
  HEART_REACT: process.env.HEART_REACT || "false",
  REJECT_CALL: process.env.REJECT_CALL || "true",
  MODE: process.env.MODE || "public",
  OWNER_NAME: process.env.OWNER_NAME || "©Bandaheali",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "923253617422",
  ANTI_DELETE: process.env.ANTI_DELETE || "true",
  DELETE_PATH: process.env.DELETE_PATH || "pm",
  WELCOME: process.env.WELCOME || "false"
};

module.exports = config;
