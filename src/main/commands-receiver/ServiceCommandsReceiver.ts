import { CommandsReceiver } from './CommandsReceiver';
import serviceManager from '../service-manager';
import { ServiceSocketMessageTypeEnum } from '../service-manager/ServiceManager';
import { AuthError, IConfig } from '../common/types';

export class ServiceCommandsReceiver extends CommandsReceiver {
  async init(): Promise<void> {
    serviceManager.on(ServiceSocketMessageTypeEnum.AUTH_ERROR, () => {
      this.errorHandler(new AuthError());
    });

    serviceManager.on(ServiceSocketMessageTypeEnum.STATE_CHANGE, ({ payload }) => {
      this.stateChangeHandler(payload);
    });

    serviceManager.on(ServiceSocketMessageTypeEnum.COMMAND, ({ payload }) => {
      this.commandsHandler(payload);
    });

    serviceManager.on(ServiceSocketMessageTypeEnum.ERROR, () => {
      this.error = new Error();
      this.errorHandler(this.error);
    });

    try {
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
    serviceManager.emit(ServiceSocketMessageTypeEnum.CONFIG, config);
  }

  public getState() {
    return { connected: this.connected, error: this.error };
  }
}
