import { SERVICE_SOCKET_PORT } from '../common/constants';
import net from 'net';
import path from 'path';
import { logger } from './logger';
import { WsCommandsReceiver } from '../main/commands-receiver/WsCommandsReceiver';
import { AuthError, IConfig } from '../main/common/types';
import { ServiceSocketMessageTypeEnum } from '../main/service-manager/ServiceManager';
import fs from 'fs/promises';

let config: IConfig;

const connections = new Map<net.Socket, net.Socket>();

const SERVICE_FOLDER = 'Voice_PC_Assistant_Service';
const SERVICE_FOLDER_PATH = path.join(process.env.PROGRAMDATA, SERVICE_FOLDER);
const CONFIG_FILE_NAME = 'config.json';

(async () => {
  config = await readConfig();
  const receiver = new WsCommandsReceiver(
    config,
    logger,
    (err) => {
      if (err instanceof AuthError) {
        sendMessageToApp({
          type: ServiceSocketMessageTypeEnum.AUTH_ERROR,
        });
      }
    },
    (command) => {
      sendMessageToApp({
        type: ServiceSocketMessageTypeEnum.COMMAND,
        payload: command,
      });
    },
    () => {
      sendMessageToApp({
        type: ServiceSocketMessageTypeEnum.STATE_CHANGE,
        payload: receiver.getState(),
      });
    }
  );

  const server = net.createServer(function (socket) {
    logger.info('Server: on connection');

    connections.set(socket, socket);

    socket.on('data', async function (c) {
      try {
        const dataStr = c.toString();

        logger.info('Server: on data: %o', dataStr);

        const parsed = JSON.parse(dataStr);

        if (parsed.type === ServiceSocketMessageTypeEnum.CONFIG) {
          await fs.writeFile(path.join(SERVICE_FOLDER_PATH, CONFIG_FILE_NAME), parsed.payload);
          receiver.updateConfig(parsed.payload);
        }
      } catch (e) {
        logger.error('%o', e);
      }
    });

    socket.on('end', function () {
      logger.info('Server: on end');
      connections.delete(socket);
    });

    socket.on('destroy', () => {
      logger.debug('destroy');
      connections.delete(socket);
    });

    socket.on('error', (e) => {
      logger.error('%o', e);
      connections.delete(socket);
    });

    socket.on('close', () => {
      logger.debug('close');
      connections.delete(socket);
    });
  });

  server.listen(SERVICE_SOCKET_PORT, function () {
    logger.info('Server: on listening');
  });
})();

async function readConfig() {
  try {
    return JSON.parse((await fs.readFile(path.join(SERVICE_FOLDER_PATH, CONFIG_FILE_NAME))).toString());
  } catch (e) {
    logger.debug(e);
  }
}

function sendMessageToApp(data: object) {
  const socket = Array.from(connections.keys())[0];

  socket?.write(JSON.stringify(data));
}
