import config from '../../config.js';

const Callupdate = async (json, sock) => {
   for (const id of json) {
      if (id.status === 'offer' && config.REJECT_CALL) {
         let msg = await sock.sendMessage(id.from, {
            text: `*𝗦𝗢𝗢𝗥𝗬 𝗙𝗢𝗥 𝗗𝗘𝗖𝗟𝗜𝗡𝗘 𝗬𝗢𝗨𝗥 𝗖𝗔𝗟𝗟*\n\n*KEEP USING SARKAR-MD*`,
            mentions: [id.from],
         });
         await sock.rejectCall(id.id, id.from);
      }
   }
};

export default Callupdate;
