import moment from 'moment-timezone';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import fetch from 'node-fetch';
import config from '../../config.js';

const OwnerCmd = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const isOwnerOrBot = m.sender === ownerNumber || m.sender === botNumber;

  // ✅ Join Group (Only Owner & Bot)
  if (cmd === 'join' && isOwnerOrBot) {
    if (!text) return m.reply('📌 *Usage:* `.join <group link>`');

    const match = text.match(/chat\.whatsapp\.com\/([\w\d]*)/);
    if (!match) return m.reply('❌ *Invalid group link!*');

    try {
      const response = await Matrix.groupAcceptInvite(match[1]);
      return m.reply(response ? '✅ *Successfully joined the group!*' : '❌ *Failed to join. Link may be invalid or expired.*');
    } catch (error) {
      console.error(error);
      return m.reply('❌ *Error: Group may be full or restricted.*');
    }
  }

  // ❌ Leave Group (Only Owner & Bot)
  if (cmd === 'left' && isOwnerOrBot) {
    try {
      await m.reply("👋 *Leaving the group...*");
      await Matrix.groupLeave(m.from);
    } catch (error) {
      console.error(error);
      await m.reply("❌ *Failed to leave the group!*");
    }
  }

  // 🚫 Block User (Only Owner & Bot)
  if (cmd === 'block' && isOwnerOrBot) {
    let target = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!target) return m.reply("⚠️ *Please mention a user or provide a number!*");

    try {
      await Matrix.updateBlockStatus(target, 'block');
      await m.reply(`🚫 *User blocked successfully!*`);
    } catch (error) {
      console.error(error);
      await m.reply("❌ *Failed to block the user!*");
    }
  }

  // ✅ Unblock User (Only Owner & Bot)
  if (cmd === 'unblock' && isOwnerOrBot) {
    let target = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!target) return m.reply("⚠️ *Please mention a user or provide a number!*");

    try {
      await Matrix.updateBlockStatus(target, 'unblock');
      await m.reply(`✅ *User unblocked successfully!*`);
    } catch (error) {
      console.error(error);
      await m.reply("❌ *Failed to unblock the user!*");
    }
  }

  // 🔥 Owner Reaction (If enabled in config)
  if (config.OWNER_REACT && isOwnerOrBot) {
    try {
      const reactions = ['👑', '🤴🏻', '〽️', '🇵🇰'];
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
      await Matrix.sendMessage(m.from, { react: { text: randomReaction, key: m.key } });
    } catch (error) {
      console.error('Error reacting to owner message:', error);
    }
  }

  // ❤️ Heart Reaction (If enabled in config)
  if (config.HEART_REACT && !isOwnerOrBot) {
    try {
      const heartReactions = ['🩷', '❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🤍', '🤎', '❤‍🔥', '💕', '💖', '💘'];
      const randomHeart = heartReactions[Math.floor(Math.random() * heartReactions.length)];
      await Matrix.sendMessage(m.from, { react: { text: randomHeart, key: m.key } });
    } catch (error) {
      console.error('Error reacting to message:', error);
    }
  }
};

// POWERED BY BANDAHEALI
export default OwnerCmd;
