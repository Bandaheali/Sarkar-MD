import config from '../../config.js';
const sarkar = config.CALL_MSG;
const Callupdate = async (json, sock) => {
   for (const id of json) {
      if (id.status === 'offer' && config.REJECT_CALL) {
         let msg = await sock.sendMessage(id.from, {
            text: `*${sarkar}*\n*KEEP USING SARKAR-MD*`,
            mentions: [id.from],
         });
         await sock.rejectCall(id.id, id.from);
      }
   }
};

export default Callupdate;
