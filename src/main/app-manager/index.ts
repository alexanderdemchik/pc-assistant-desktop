import serviceManager from '../../common/service-manager';
import { WsConnectionManager } from '../../common/ws-connection-manager/WsConnectionManager';
import { logger } from '../logger';
import { config } from '../config';
import { EventsNamesEnum, eventsManager } from '../events';
import { ServiceMessageStateChange, ServiceMessageTypeEnum } from '../../common/service-manager/ServiceManager';
import { AuthError } from '../common/types';
import { CacheManager } from '../../common/cache-manager/CacheManager';
import { app } from 'electron';

export let connected = false;
export let error: Error = null;
export let cacheManager: CacheManager;

let isServiceFlow = true;
let ws: WsConnectionManager;

const errorHandler = (err: Error) => {
  if (err instanceof AuthError) {
    eventsManager.emit(EventsNamesEnum.AUTH_REQUIRED);
  }
};

const serviceMessageHandler = (type: ServiceMessageTypeEnum, payload: unknown) => {
  logger.debug('serviceMessageHandler');
  switch (type) {
    case ServiceMessageTypeEnum.AUTH_ERROR:
      error = new AuthError();
      eventsManager.emit(EventsNamesEnum.AUTH_REQUIRED);
      break;
    case ServiceMessageTypeEnum.ERROR:
      error = new Error();

      ws = new WsConnectionManager(
        config,
        logger,
        errorHandler,
        () => {},
        (state) => {
          connected = state.connected;
          error = state.error;
        }
      );

      ws.init();
      break;
    case ServiceMessageTypeEnum.STATE_CHANGE:
      connected = (payload as ServiceMessageStateChange).connected;
      eventsManager.emit(EventsNamesEnum.REMOTE_CONNECTION_STATE_CHANGE);
      break;
  }
};

export async function init() {
  cacheManager = await new CacheManager(app.getPath('userData')).init();
  try {
    serviceManager.subscribe(serviceMessageHandler);

    await serviceManager.init();

    serviceManager.sendMessage(ServiceMessageTypeEnum.CONFIG, config);
  } catch (e) {
    logger.error('Error to init service');

    isServiceFlow = false;

    ws = new WsConnectionManager(
      config,
      logger,
      errorHandler,
      () => {},
      (state) => {
        connected = state.connected;
        error = state.error;
      }
    );

    ws.init();
  }

  eventsManager.on(EventsNamesEnum.TOKEN_RECEIVED, () => {
    isServiceFlow ? serviceManager.sendMessage(ServiceMessageTypeEnum.CONFIG, config) : ws.updateConfig(config);
  });
}
