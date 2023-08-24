import { CommandsReceiver } from './CommandsReceiver';
import serviceManager from '../service-manager';
import { ServiceMessageStateChange, ServiceMessageTypeEnum } from '../service-manager/ServiceManager';
import { AuthError, IConfig } from '../common/types';

export class ServiceCommandsReceiver extends CommandsReceiver {
  serviceMessageHandler = (type: ServiceMessageTypeEnum, payload: unknown) => {
    this.logger.debug('serviceMessageHandler');
    switch (type) {
      case ServiceMessageTypeEnum.AUTH_ERROR:
        this.error = new AuthError();
        this.errorHandler(new AuthError());
        break;
      case ServiceMessageTypeEnum.COMMAND:
        this.commandsHandler(payload as string);

        break;
      case ServiceMessageTypeEnum.ERROR:
        this.error = new Error();
        this.errorHandler(this.error);
        break;
      case ServiceMessageTypeEnum.STATE_CHANGE:
        this.connected = (payload as ServiceMessageStateChange).connected;

        this.stateChangeHandler({ connected: this.connected });
        break;
    }
  };

  async init(): Promise<void> {
    try {
      serviceManager.subscribe(this.serviceMessageHandler);
      await serviceManager.init();
    } catch (e) {
      this.logger.debug('Error to init service %o', e);
      serviceManager.dispose();
      throw e;
    }
  }

  public dispose(): void {
    serviceManager.dispose();
  }

  public updateConfig(config: IConfig) {
    serviceManager.sendMessage(ServiceMessageTypeEnum.CONFIG, config);
  }

  public getState() {
    return { connected: this.connected, error: this.error };
  }
}
