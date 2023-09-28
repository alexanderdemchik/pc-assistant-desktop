process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { SERVICE_SOCKET_PORT } from '../common/constants';
import net from 'net';
import path from 'path';
import { AuthError, IConfig } from '../main/common/types';
import { ServiceMessageTypeEnum } from '../common/service-manager/ServiceManager';
import { UpgradedSocketClient, upgradeSocketClient } from '../common/upgradeSocketClient';
import fs from 'fs/promises';
import { WsConnectionManager } from '../common/ws-connection-manager/WsConnectionManager';
import { CacheManager } from '../common/cache-manager/CacheManager';
import { registerLogger, logger } from '../main/logger';
import { ServiceClientIdEnum } from '../common/service-manager/types';
import { NlpMatcher } from '../common/action-matchers/NlpMatcher';
import { ICacheCommandLogEntry } from '../common/cache-manager/types';
import { launchProcessAsSystemUser } from 'native_lib';
import { ACTION_EXECUTOR_APP_NAME } from '../common/constants/appNames';
import { extractActionPayload } from '../common/action-matchers/helpers';

let config: IConfig;

interface ISocketInfo {
  clientId?: ServiceClientIdEnum;
}

const connections = new Map<UpgradedSocketClient, ISocketInfo>();

const SERVICE_FOLDER = 'Voice_PC_Assistant_Service';
const SERVICE_FOLDER_PATH = path.join(process.env.PROGRAMDATA, SERVICE_FOLDER);
const CONFIG_FILE_NAME = 'config.json';
const DESKTOP_MANAGER_PATH = path.join(process.env.PROGRAMDATA, SERVICE_FOLDER, ACTION_EXECUTOR_APP_NAME + '.exe');

let cacheManager: CacheManager;
const matcher = new NlpMatcher();

(async () => {
  registerLogger(undefined, `${SERVICE_FOLDER_PATH}/logs/service-%DATE%.log`);

  config = await readConfig();

  initCache(config);

  const server = net.createServer(function (socket: UpgradedSocketClient) {
    upgradeSocketClient(socket);
    logger.info('Server: on connection');

    connections.set(socket, {});

    sendMessageToUi({
      type: ServiceMessageTypeEnum.STATE_CHANGE,
      payload: wsManager.getState(),
    });

    socket.on('message', async function (message) {
      try {
        logger.debug('Server: on message %o', message);

        const parsed = message;

        if (parsed.type === ServiceMessageTypeEnum.SET_CLIENT_ID) {
          connections.set(socket, { clientId: parsed.payload });
          parsed.payload === ServiceClientIdEnum.UI
            ? sendMessageToUi({
                type: ServiceMessageTypeEnum.STATE_CHANGE,
                payload: wsManager.getState(),
              })
            : sendMessageToBackgroundManager({
                type: ServiceMessageTypeEnum.CONFIG,
                payload: config,
              });
        }

        if (parsed.type === ServiceMessageTypeEnum.CONFIG) {
          config = parsed.payload;
          await fs.writeFile(path.join(SERVICE_FOLDER_PATH, CONFIG_FILE_NAME), JSON.stringify(parsed.payload));
          wsManager.updateConfig(parsed.payload);
          initCache(parsed.payload);
          sendMessageToBackgroundManager({
            type: ServiceMessageTypeEnum.CONFIG,
            payload: config,
          });
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

  const wsManager = new WsConnectionManager(
    config,
    logger,
    (err) => {
      if (err instanceof AuthError) {
        sendMessageToUi({
          type: ServiceMessageTypeEnum.AUTH_ERROR,
        });
      }
    },
    async (message) => {
      if (message.command) {
        const matchedAction = await matcher.match(message.command);

        if (matchedAction) {
          logger.debug(`matched command ${message.command}`);
          sendMessageToBackgroundManager({
            type: matchedAction,
            payload: extractActionPayload(matchedAction, message.command),
          });

          addCommandToLog(message.command, true);
        } else {
          logger.debug(`failed to match command ${message.command}`);

          addCommandToLog(message.command, false);
        }
      }
    },
    () => {
      sendMessageToUi({
        type: ServiceMessageTypeEnum.STATE_CHANGE,
        payload: wsManager.getState(),
      });
    }
  );

  if (config?.token) {
    wsManager.init();
  }

  server.listen(SERVICE_SOCKET_PORT, function () {
    logger.info('Server: on listening');
  });

  console.log(launchProcessAsSystemUser(DESKTOP_MANAGER_PATH));
})();

async function readConfig() {
  try {
    return JSON.parse((await fs.readFile(path.join(SERVICE_FOLDER_PATH, CONFIG_FILE_NAME))).toString());
  } catch (e) {
    logger.debug(e);
  }
}

async function initCache(config: IConfig) {
  if (config?.appUserDataPath) {
    cacheManager = await new CacheManager(config.appUserDataPath).init();
  }
}

function sendMessageToUi(data: object) {
  console.log('send message to app %o', data);

  let socket: net.Socket;

  connections.forEach((value, key) => {
    if (value.clientId === ServiceClientIdEnum.UI) {
      socket = key;
    }
  });

  socket?.write(JSON.stringify(data));

  return !!socket;
}

function sendMessageToBackgroundManager(data: object) {
  console.log('send message to background manager %o', data);

  let socket: UpgradedSocketClient;

  connections.forEach((value, key) => {
    if (value.clientId === ServiceClientIdEnum.DESKTOP_ACTIONS_MANAGER) {
      socket = key;
    }
  });

  socket?.write(JSON.stringify(data));

  return !!socket;
}

async function sendMessageToBackgroundManagerWithAck(data: object) {
  console.log('send message to background manager %o', data);

  let socket: UpgradedSocketClient;

  connections.forEach((value, key) => {
    if (value.clientId === ServiceClientIdEnum.DESKTOP_ACTIONS_MANAGER) {
      socket = key;
    }
  });

  return await socket?.writeWithAck(JSON.stringify(data));
}

async function addCommandToLog(command: string, executed: boolean) {
  const newLogEntry: ICacheCommandLogEntry = {
    datetime: new Date(),
    command,
    executed,
  };

  const newCommandLog = [...(await cacheManager.get('commandsLog')), newLogEntry];

  return await cacheManager.set('commandsLog', newCommandLog);
}
