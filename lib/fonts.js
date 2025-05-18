// lib/fonts.js

// 1. fancy1 (Cursive style)
const fancy1 = {
  a: '𝒶', b: '𝒷', c: '𝒸', d: '𝒹', e: 'ℯ', f: '𝒻', g: 'ℊ',
  h: '𝒽', i: '𝒾', j: '𝒿', k: '𝓀', l: '𝓁', m: '𝓂',
  n: '𝓃', o: 'ℴ', p: '𝓅', q: '𝓆', r: '𝓇', s: '𝓈',
  t: '𝓉', u: '𝓊', v: '𝓋', w: '𝓌', x: '𝓍', y: '𝓎', z: '𝓏'
};

// 2. strikeThrough (With ~ line through text)
const strikeThrough = {};
'abcdefghijklmnopqrstuvwxyz'.split('').forEach(c => {
  strikeThrough[c] = c + '\u0336'; // a̶ style
});

// 3. typewriter (Monospace style)
const typewriter = {
  a: '𝚊', b: '𝚋', c: '𝚌', d: '𝚍', e: '𝚎', f: '𝚏', g: '𝚐',
  h: '𝚑', i: '𝚒', j: '𝚓', k: '𝚔', l: '𝚕', m: '𝚖',
  n: '𝚗', o: '𝚘', p: '𝚙', q: '𝚚', r: '𝚛', s: '𝚜',
  t: '𝚝', u: '𝚞', v: '𝚟', w: '𝚠', x: '𝚡', y: '𝚢', z: '𝚣'
};

const allFonts = {
  fancy1,
  strikeThrough,
  typewriter
};

// Convert plain text using selected font
function stylize(text, fontName) {
  const font = allFonts[fontName];
  if (!font) return text;

  return text.split('').map(char => {
    const lower = char.toLowerCase();
    return font[lower] || char;
  }).join('');
}

export { allFonts, stylize };
