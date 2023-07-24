import { CommandsReceiver } from './CommandsReceiver';
import serviceManager from '../service-manager';
import { ServiceSocketMessageTypeEnum } from '../service-manager/ServiceManager';
import { AuthError } from '../common/types';
import { IConfig } from '../config';

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

    try {
      await serviceManager.init();
    } catch (e) {
      this.logger.debug('Error to init service');
      serviceManager.dispose();
      throw e;
    }
  }

  public updateConfig(config: IConfig) {
    serviceManager.emit(ServiceSocketMessageTypeEnum.CONFIG, config);
  }

  public getState() {
    return { connected: this.connected, error: this.error };
  }
}
