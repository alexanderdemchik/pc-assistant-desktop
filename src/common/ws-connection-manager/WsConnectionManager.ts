import { Socket, io } from 'socket.io-client';
import { AuthError, IConfig } from '../../main/common/types';
import { Logger } from 'winston';

interface WsManagerState {
  connected: boolean;
  error?: Error;
}

export class WsConnectionManager {
  private socketInstance: Socket = null;
  private connected = false;
  private error: Error = null;

  constructor(
    private config: IConfig = {} as IConfig,
    private logger: Logger,
    private errorHandler: (err: Error) => void,
    private messageHandler: (message: any) => void,
    private stateChangeHandler: (state: WsManagerState) => void
  ) {}

  private updateState(connected?: boolean, error?: Error): void {
    this.connected = connected;
    this.error = error;

    this.stateChangeHandler({ connected: this.connected, error: this.error });
  }

  async init(): Promise<void> {
    this.logger.debug('init');

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
      reconnection: true,
      reconnectionDelay: 3000,
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
        this.errorHandler(e);
      }
    });

    this.socketInstance.on('message', (message) => {
      this.messageHandler(message);
    });
  }

  public updateConfig(config: IConfig) {
    this.logger.debug(`[WSCommandsReceiver}] updateConfig`);

    if (this.config.token !== config.token) {
      this.config = config;

      this.socketInstance?.close();

      this.init();
    } else {
      if (this.error instanceof AuthError) {
        this.errorHandler(this.error);
      }
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
