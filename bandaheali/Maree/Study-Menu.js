import config from '../../config.js';
import axios from 'axios';

const studycommand = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) 
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    // ======================== 📚 STUDY MENU ========================
    if (cmd === 'study' || cmd === 'studymenu') {
        const studyMenu = `
🔬 *SCIENCE & STUDY COMMANDS* 🔍

🧮 *Math:*
▸ ${prefix}math [topic] → Algebra, Trigonometry, Calculus
▸ ${prefix}solve [equation] → Solves math equations
▸ ${prefix}convert [value][unit] to [unit] → Unit conversion

⚗ *Chemistry:*
▸ ${prefix}chem [query] → Chemical reactions & formulas
▸ ${prefix}element [symbol/name] → Periodic table info
▸ ${prefix}molar [compound] → Molar mass calculator

⚡ *Physics:*
▸ ${prefix}physics [topic] → Formulas (Kinematics, Thermodynamics)
▸ ${prefix}constants → Physical constants (c, h, G, etc.)

📖 *General Knowledge (GK):*
▸ ${prefix}gk [topic] → Facts (Science, History, Geography)
▸ ${prefix}quiz → Random GK quiz

💡 *Examples:*
• ${prefix}math quadratic
• ${prefix}chem "H2 + O2"
• ${prefix}element Na
• ${prefix}gk "speed of light"

⚡ *Powered By ${config.BOT_NAME}* ⚡
`;
        return sock.sendMessage(m.from, { text: studyMenu }, { quoted: m });
    }

    // ======================== 🧮 MATH FORMULAS & EQUATION SOLVER ========================
    if (cmd === 'math') {
        if (!text) return m.reply("❌ Please specify a topic! (e.g., algebra, quadratic, calculus)");
        
        try {
            const response = await axios.get(`https://api.mathjs.org/v4/?expr=${encodeURIComponent(text)}`);
            return m.reply(`🧮 *Solution:*\n\`\`\`${response.data}\`\`\``);
        } catch (err) {
            const mathFormulas = {
                "quadratic": `🔹 *Quadratic Formula* 🔹\n\n\`\`\`x = [-b ± √(b² - 4ac)] / 2a\`\`\``,
                "algebra": `🔹 *Basic Algebra Formulas* 🔹\n\n• (a + b)² = a² + 2ab + b²\n• (a - b)² = a² - 2ab + b²\n• a² - b² = (a + b)(a - b)`,
                "calculus": `🔹 *Calculus Basics* 🔹\n\n• Derivative: dy/dx = lim(Δx→0) [f(x+Δx) - f(x)]/Δx\n• Integral: ∫f(x)dx = F(x) + C`,
            };
            
            const topic = text.toLowerCase();
            if (mathFormulas[topic]) {
                return m.reply(mathFormulas[topic]);
            } else {
                return m.reply("❌ Topic not found! Try: quadratic, algebra, calculus");
            }
        }
    }

    // ======================== ⚗ CHEMISTRY FORMULAS & REACTIONS ========================
    if (cmd === 'chem') {
        if (!text) return m.reply("❌ Enter a query! (e.g., H2 + O2, molar mass of H2SO4)");
        
        try {
            const response = await axios.get(`https://api.chemicalize.com/v1/calculation?q=${encodeURIComponent(text)}`);
            const result = response.data;
            return m.reply(`⚗ *Result:*\n${result.formula}\nMolar Mass: ${result.molarMass} g/mol`);
        } catch (err) {
            return m.reply("❌ API Error. Try again later.");
        }
    }

    // ======================== ⚡ PHYSICS FORMULAS ========================
    if (cmd === 'physics') {
        if (!text) return m.reply("❌ Enter a topic! (e.g., kinematics, thermodynamics)");
        
        try {
            const response = await axios.get(`https://api.wolframalpha.com/v1/result?i=${encodeURIComponent(text)}&appid=YOUR_WOLFRAM_API_KEY`);
            return m.reply(`⚡ *Physics Formula:*\n${response.data}`);
        } catch (err) {
            return m.reply("❌ Could not fetch data. Try: kinematics, thermodynamics");
        }
    }

    // ======================== 📖 GENERAL KNOWLEDGE (GK) ========================
    if (cmd === 'gk') {
        if (!text) return m.reply("❌ Enter a topic! (e.g., speed of light, capital of France)");
        
        try {
            const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`);
            const summary = response.data.extract;
            return m.reply(`📖 *${text.toUpperCase()}*\n\n${summary}`);
        } catch (err) {
            return m.reply("❌ Could not fetch GK data. Try another query.");
        }
    }

    // ======================== 🧪 PERIODIC TABLE ELEMENT LOOKUP ========================
    if (cmd === 'element') {
        if (!text) return m.reply("❌ Enter an element name/symbol! (e.g., Na, Hydrogen)");
        
        try {
            const response = await axios.get(`https://periodic-table-api.herokuapp.com/atomicName/${encodeURIComponent(text)}`);
            const element = response.data;
            return m.reply(
                `⚛ *${element.name} (${element.symbol})*\n\n` +
                `- Atomic Number: ${element.atomicNumber}\n` +
                `- Atomic Mass: ${element.atomicMass}\n` +
                `- Group: ${element.groupBlock}\n` +
                `- State: ${element.standardState}`
            );
        } catch (err) {
            return m.reply("❌ Element not found! Try: H, O, Na, Fe");
        }
    }
};

export default studycommand;
