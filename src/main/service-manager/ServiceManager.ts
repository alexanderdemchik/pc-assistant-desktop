import { Disposable } from '../common/types';

export enum ServiceMessageTypeEnum {
  CONFIG = 'CONFIG',
  AUTH_ERROR = 'AUTH_ERROR',
  STATE_CHANGE = 'STATE_CHANGE',
  COMMAND = 'COMMAND',
  ERROR = 'ERROR',
}

export interface ServiceMessageStateChange {
  connected: boolean;
}

type ServiceMessageHandler = (type: ServiceMessageTypeEnum, payload?: unknown) => void;

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
  abstract sendMessage(type: ServiceMessageTypeEnum, payload?: object): void;
  abstract init(): Promise<void>;
  abstract dispose(): void;
}
