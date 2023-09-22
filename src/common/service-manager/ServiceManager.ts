import { Disposable } from '../../main/common/types';
import { ServiceClientIdEnum } from './types';

export enum ServiceMessageTypeEnum {
  CONFIG = 'CONFIG',
  AUTH_ERROR = 'AUTH_ERROR',
  STATE_CHANGE = 'STATE_CHANGE',
  COMMAND = 'COMMAND',
  ERROR = 'ERROR',
  SET_CLIENT_ID = 'SET_CLIENT_ID',
}

export interface ServiceMessageStateChange {
  connected: boolean;
}

type ServiceMessageHandler = (type: unknown, payload?: unknown) => void;

export abstract class ServiceManager implements Disposable {
  protected messageHandlers: Array<ServiceMessageHandler> = [];
  public subscribe(handler: ServiceMessageHandler) {
    this.messageHandlers.push(handler);
  }
  public unsubscribe(handler: ServiceMessageHandler) {
    this.messageHandlers = this.messageHandlers.filter((h) => {
      h !== handler;
    });
  }
  abstract sendMessage(type: unknown, payload?: unknown): void;
  abstract init(clientId?: ServiceClientIdEnum): Promise<void>;
  abstract dispose(): void;
}
