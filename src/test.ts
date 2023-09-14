import Peer from 'peerjs';
const peerOptions = {
  host: 'pcmanager.aliaksandrdzemchyk.site',
  port: 443,
  path: '/peer',
  config: {
    iceServers: [
      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808',
      },
      {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808',
      },
    ],
  },
};

const peer = new Peer('asdads', peerOptions);

const con = peer.connect('5d8cbf89-db12-41e1-8007-65101d627a9d');

con.on('data', (data) => {
  console.log(data);
});
