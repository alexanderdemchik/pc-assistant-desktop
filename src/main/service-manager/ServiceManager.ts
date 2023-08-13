import { EventEmitter } from 'stream';
import { Disposable } from '../common/types';

export enum ServiceSocketMessageTypeEnum {
  CONFIG = 'CONFIG',
  AUTH_ERROR = 'AUTH_ERROR',
  STATE_CHANGE = 'STATE_CHANGE',
  COMMAND = 'COMMAND',
  ERROR = 'ERROR',
}

export abstract class ServiceManager extends EventEmitter implements Disposable {
  abstract init(): Promise<void>;
  abstract dispose(): void;
}
