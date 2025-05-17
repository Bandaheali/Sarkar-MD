
import fs from 'fs';
const settingsFile = './settings.json';

// Save to file
export const setSetting = (key, value) => {
  let settings = {};
  if (fs.existsSync(settingsFile)) {
    settings = JSON.parse(fs.readFileSync(settingsFile));
  }
  settings[key] = value;
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
};

// Read fresh from file every time
export const getSetting = (key) => {
  if (!fs.existsSync(settingsFile)) return false;
  const settings = JSON.parse(fs.readFileSync(settingsFile));
  return settings[key] || false;
};













/*import fs from 'fs';
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
*/
