const heartEmojis = ['💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '🔥'];

async function doHeartReact(mek, gss) {
  try {
    const randomHeart = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    const react = {
      react: {
        text: randomHeart,
        key: mek.key,
      },
    };

    await gss.sendMessage(mek.key.remoteJid, react);
  } catch (error) {
    console.error('Error sending heart reaction:', error);
  }
}

module.exports = { heartEmojis, doHeartReact };