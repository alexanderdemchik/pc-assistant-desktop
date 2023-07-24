import { SERVICE_SOCKET_PORT } from '../common/constants';
import net from 'net';
import { logger } from './logger';

const server = net.createServer(function (stream) {
  logger.info('Server: on connection');
  //@ts-ignore

  stream.on('data', function (c) {
    logger.info('Server: on data:', c.toString());
  });

  stream.on('end', function () {
    logger.info('Server: on end');
  });
});

server.on('close', function () {
  logger.info('Server: on close');
});

server.listen(SERVICE_SOCKET_PORT, function () {
  logger.info('Server: on listening');
});
