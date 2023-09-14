import Peer from 'peerjs';
import { getConfig, getSources } from '../../renderer/api';
// import logger from '../../renderer/logger';

export const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
};

export const createEmptyVideoTrack = ({ width, height }) => {
  const canvas = Object.assign(document.createElement('canvas'), { width, height });
  canvas.getContext('2d').fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: false });
};

const audioTrack = createEmptyAudioTrack();
const videoTrack = createEmptyVideoTrack({ width: 640, height: 480 });
const mediaStream = new MediaStream([audioTrack, videoTrack]);

async function main() {
  // logger.debug('Started hidden desktop-sharing window');

  // const config = await getConfig();
  const sources = await getSources();

  // logger.debug('%o', config);
  const peerOptions = {
    // host: new URL(config.serverUrl).hostname,
    host: 'pcmanager.aliaksandrdzemchyk.site',
    port: 443,
    secure: true,
    path: '/peer',
    config: {
      iceServers: [
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

  const peer = new Peer('5d8cbf89-db12-41e1-8007-65101d627a9d', peerOptions);

  peer.on('call', (call) => {
    // logger.debug('call');
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          // @ts-ignore
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sources[call.metadata.screen],
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720,
          },
        },
      })
      .then((mediaStream) => {
        // Answer call with screen's display data stream
        call.answer(mediaStream);
      })
      .catch((e) => console.log('Error: ' + e));
  });

  // setTimeout(() => {
  //   const peer2 = new Peer('asdads', peerOptions);

  //   peer2.on('open', () => {
  //     const call = peer2.call(config.deviceId, mediaStream, { metadata: { screen: 0 } });
  //     const call2 = peer2.call(config.deviceId, mediaStream, { metadata: { screen: 1 } });

  //     call.on('stream', (stream) => {
  //       logger.debug('stream');
  //       const video = document.createElement('video');
  //       document.body.appendChild(video);
  //       video.autoplay = true;
  //       video.srcObject = stream;
  //     });

  //     call2.on('stream', (stream) => {
  //       logger.debug('stream');
  //       const video = document.createElement('video');
  //       document.body.appendChild(video);
  //       video.autoplay = true;
  //       video.srcObject = stream;
  //     });
  //   });
  // }, 5000);

  //   navigator.mediaDevices
  //     .getUserMedia({
  //       audio: false,
  //       video: {
  //         // @ts-ignore
  //         mandatory: {
  //           cursor: 'never',
  //           chromeMediaSource: 'desktop',
  //           chromeMediaSourceId: sources[0],
  //           minWidth: 1280,
  //           maxWidth: 1280,
  //           minHeight: 720,
  //           maxHeight: 720,
  //         },
  //       },
  //     })
  //     .then((mediaStream) => {
  //       // Answer call with screen's display data stream
  //       video.srcObject = mediaStream;
  //       video.play();
  //     });
}

main();
