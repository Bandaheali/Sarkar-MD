import config from '../../config.js';

const Callupdate = async (json, sock) => {
   for (const id of json) {
      if (id.status === 'offer' && config.REJECT_CALL) {
         await sock.rejectCall(id.id, id.from);
      }
   }
};

export default Callupdate;
