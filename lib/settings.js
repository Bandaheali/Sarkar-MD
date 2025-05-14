import fs from 'fs';
const settingsFile = './settings.json';

let settings = {};
if (fs.existsSync(settingsFile)) {
  settings = JSON.parse(fs.readFileSync(settingsFile));
}

export const setSetting = (key, value) => {
  settings[key] = value;
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
};

export const getSetting = (key) => {
  return settings[key] || false;
};
