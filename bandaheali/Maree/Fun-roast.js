import config from '../../config.cjs';

const roast = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const owner = config.OWNER_NUMBER;
  const bot = await sock.decodeJid(sock.user.id);
  const dev = "923253617422@s.whatsapp.net";
  const isCreater = [owner + '@s.whatsapp.net', bot, dev];
  const text = m.body.slice(prefix.length + cmd.length).trim();

  // Roast database
      let roasts = [
        "Abe bhai, tera IQ wifi signal se bhi kam hai!",
        "Bhai, teri soch WhatsApp status jaisi hai, 24 ghante baad gayab ho jaati hai!",
        "Abe sochta kitna hai, tu kya NASA ka scientist hai?",
        "Abe tu hai kaun? Google pe search karne se bhi tera naam nahi aata!",
        "Tera dimaag 2G network pe chal raha hai kya?",
        "Itna overthink mat kar bhai, teri battery jaldi down ho jayegi!",
        "Teri soch cricket ke match jaisi hai, baarish aate hi band ho jati hai!",
        "Tu VIP hai, 'Very Idiotic Person'!",
    "Abe bhai, tera IQ wifi signal se bhi kam hai!",
    "Bhai, teri soch WhatsApp status jaisi hai, 24 ghante baad gayab ho jaati hai!",
    "Abe tu kis planet se aaya hai, yeh duniya tere jaise aliens ke liye nahi hai!",
    "Tere dimag mein khojne ka itna kuch hai, lekin koi result nahi milta!",
    "Teri zindagi WhatsApp status jaisi hai, kabhi bhi delete ho sakti hai!",
    "Tera style bilkul WiFi password ki tarah hai, sabko pata nahi!",
    "Abe tu toh wahi hai jo apni zindagi ka plot twist bhi Google karta hai!",
    "Abe tu toh software update bhi nahi chalne wala, pura hang hai!",
    "Tere sochne se zyada toh Google search karne mein time waste ho jaata hai!",
    "Mere paas koi shabdon ki kami nahi hai, bas tujhe roast karne ka mood nahi tha!",
    "Teri personality toh dead battery jaisi hai, recharge karne ka time aa gaya hai!",
    "Bhai, teri soch ke liye ek dedicated server hona chahiye!",
    "Abe tu kaunsa game khel raha hai, jisme har baar fail ho jaata hai?",
    "Tere jokes bhi software update ki tarah hote hain, baar-baar lagte hain par kaam nahi karte!",
    "Teri wajah se toh mere phone ka storage bhi full ho jaata hai!",
    "Abe bhai, tu na ek walking meme ban gaya hai!",
    "Abe apne aap ko bada smart samajhta hai, par teri brain cells toh overload mein hain!",
    "Teri wajah se toh humari group chat ko mute karne ka sochna padta hai!",
    "Abe tere jaise log hamesha apne aap ko hero samajhte hain, par actually toh tum villain ho!",
    "Tere jaise logon ke liye zindagi mein rewind aur fast forward button hona chahiye!",
    "Tere mooh se nikla har lafz ek naya bug hai!",
    "Abe tu apni zindagi ke saath save nahi kar paaya, aur dusron ke liye advice de raha hai!",
    "Tu apne life ka sabse bada virus hai!",
    "Abe tu hain ya koi broken app?",
    "Tere soch ke liye CPU ki zarurat hai, par lagta hai tera CPU khatam ho gaya!",
    "Abe tu kya kar raha hai, ek walking error message ban gaya hai!",
    "Teri taareef toh bas lagti hai, par teri asli aukaat toh sabko pata hai!",
    "Tera brain toh ek broken link ki tarah hai, sab kuch dhundne ke bawajood kuch nahi milta!",
    "Bhai, tujhe dekh ke toh lagta hai, Netflix bhi teri wajah se crash ho gaya!",
    "Teri tasveer toh bas ek screenshot lagti hai, real life mein tu kuch bhi nahi!",
    "Abe bhai, tu lagta hai toh I-phone ho, lekin andar kaafi purana android hai!",
    "Abe, tere jaisi soch se toh Google bhi nafrat karta hoga!",
    "Bhai tu apne chehre se ghazab ka mood bana le, shayad koi notice kar le!",
    "Tere kaam bhi uss app ki tarah hote hain jo crash ho jata hai jab sabko zarurat ho!",
    "Teri zindagi ke sabse bada hack toh hai - 'Log mujhse kuch bhi expect mat karo'!",
    "Abe tu apne aap ko hi mirror mein dekh ke samajhta hai ki sab kuch sahi hai!",
    "Abe tu apne dimaag ko low power mode mein daalke chalta hai!",
    "Tere paas ideas hain, par sab outdated hain jaise Windows XP!",
    "Teri soch toh ek system error ki tarah hai, restart karna padega!",
    "Teri personality toh ek empty hard drive jaise hai, kuch bhi valuable nahi!", 
    "Abe tu kis planet se aaya hai, yeh duniya tere jaise logon ke liye nahi hai!",
    "Tere chehre pe kisi ne 'loading' likh diya hai, par kabhi bhi complete nahi hota!",
    "Tera dimaag toh ek broken link ki tarah hai, kabhi bhi connect nahi hota!",
    "Abe, teri soch se toh Google ka algorithm bhi confused ho jata hai!",
    "Tere jaisa banda, aur aise ideas? Yeh toh humne science fiction mein dekha tha!",
    "Abe tu apne chehre pe 'not found' likhwa le, kyunki sabko kuch milta nahi!",
    "Teri soch itni slow hai, Google bhi teri madad nahi kar paata!",
    "Abe tu toh '404 not found' ka living example hai!",
    "Tera dimaag bhi phone ki battery jaise hai, kabhi bhi drain ho jaata hai!",
    "Abe tu toh wahi hai, jo apni zindagi ka password bhool jaata hai!",
    "Abe tu jise apni soch samajhta hai, wo ek 'buffering' hai!",
    "Teri life ke decisions itne confusing hain, ki KBC ke host bhi haraan ho jaaye!",
    "Bhai, tere jaise logo ke liye ek dedicated 'error' page hona chahiye!",
    "Teri zindagi ko 'user not found' ka message mil gaya hai!",
    "Teri baatein utni hi value rakhti hain, jitni 90s ke mobile phones mein camera quality thi!",
    "Abe bhai, tu toh har waqt 'under construction' rehta hai!",
    "Tere saath toh life ka 'unknown error' hota hai, koi solution nahi milta!",
    "Bhai, tere chehre pe ek warning sign hona chahiye - 'Caution: Too much stupidity ahead'!",
    "Teri har baat pe lagta hai, system crash hone waala hai!",
    "Tere paas idea hai, par wo abhi bhi 'under review' hai!"
];               
        
  if (cmd === "roast") {
  if (!m.isGroup) {
    await sock.sendMessage(
      m.from,
      { text: "❌ This command only works in groups!" },
      { quoted: m }
    );
    return;
  }

  try {
    await m.React('🔥');

    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const mentionedIds = quoted?.mentionedJid || [];

    let targetJid;

    // Priority 1: If user replied to someone
    if (quoted?.participant) {
      targetJid = quoted.participant;
    }
    // Priority 2: If user mentioned someone
    else if (mentionedIds.length > 0) {
      targetJid = mentionedIds[0];
    }

    // No target found
    if (!targetJid) {
      await sock.sendMessage(
        m.from,
        { text: `⚠️ Please mention or reply to someone to roast!\nExample: *${prefix}roast @user* or reply with *${prefix}roast*` },
        { quoted: m }
      );
      await m.React('❌');
      return;
    }

    // Get user name
    const user = await sock.onWhatsApp(targetJid);
    const username = user[0]?.name || user[0]?.pushname || "User";
    if(isCreater.includes(targetJid) {
      await sock.sendMessage(
        m.from,
        { text: `I CANT ROAST MY OWNER SOORY` },
        { quoted: m }
        );
    }
    await m.react('✋️');
    return;
  }

    // Get random roast
    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    const responseText = `@${targetJid.split('@')[0]} ${randomRoast}`;

    await sock.sendMessage(
      m.from,
      {
        text: responseText,
        mentions: [targetJid]
      },
      { quoted: m }
    );

    await m.React('😂');
  } catch (error) {
    console.error('Error in roast command:', error);
    await m.React('❌');
    await sock.sendMessage(
      m.from,
      { text: "⚠️ Failed to roast. Try again later!" },
      { quoted: m }
    );
  }
      }
};
export default roast;
