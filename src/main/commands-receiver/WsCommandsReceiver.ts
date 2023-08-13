import { Socket, io } from 'socket.io-client';
import { CommandsReceiver } from './CommandsReceiver';
import { AuthError, IConfig } from '../common/types';

export class WsCommandsReceiver extends CommandsReceiver {
  private socketInstance: Socket = null;

  private updateState(connected?: boolean, error?: Error): void {
    this.connected = connected;
    this.error = error;

    this.stateChangeHandler({ connected: this.connected, error: this.error });
  }

  async init(): Promise<void> {
    this.logger.debug('init', { prefix: 'WSCommandsReceiver' });

    if (!this.config.token) {
      this.error = new AuthError();
      this.errorHandler(new AuthError());
    }

    this.socketInstance = io(`${this.config.serverUrl}`, {
      path: '/ws',
      query: { deviceId: this.config.deviceId },
      auth: {
        token: this.config.token,
      },
      transports: ['websocket'],
    }).connect();

    this.socketInstance.on('disconnect', () => {
      this.updateState(false, this.error);
    });

    this.socketInstance.on('connect', () => {
      this.logger.info('WS Connected');

      this.updateState(true, null);
    });

    this.socketInstance.on('connect_error', (e) => {
      this.logger.info('WS Connect Error %o', e);

      if (e.message === 'Auth error') {
        this.error = new AuthError();
        this.errorHandler(this.error);
      } else {
        this.error = e;
        this.errorHandler(e);
      }
    });

    this.socketInstance.on('message', (message) => {
      if (message.command) {
        this.commandsHandler(message.command);
      }
    });
  }

  public updateConfig(config: IConfig) {
    this.logger.debug(`[WSCommandsReceiver}] updateConfig`);

    if (this.config.token !== config.token) {
      this.config = config;

      this.socketInstance?.close();

      this.init();
    }
  }

  public getState() {
    return {
      error: this.error,
      connected: this.connected,
    };
  }

  public dispose(): void {
    this.socketInstance?.close();
  }
}
