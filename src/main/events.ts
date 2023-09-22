import EventEmitter from 'events';
import { logger } from './logger';

export enum EventsNamesEnum {
  TOKEN_RECEIVED = 'TOKEN_RECEIVED',
  TOKEN_RECEIVE_ERROR = 'TOKEN_RECEIVE_ERROR',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  REMOTE_CONNECTION_STATE_CHANGE = 'REMOTE_CONNECTION_STATE_CHANGE',
}

export const eventsManager = new EventEmitter();

const originalEmit = eventsManager.emit;

eventsManager.emit = (event, ...args) => {
  logger.debug(`emit ${String(event)}`);
  return originalEmit.call(eventsManager, event, ...args);
};
