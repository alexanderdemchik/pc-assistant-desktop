import { SERVICE_SOCKET_PORT } from '../constants';
import { ServiceManager, ServiceMessageTypeEnum } from './ServiceManager';
import net from 'net';
import { logger } from '../../main/logger';
import { waitFor } from '../../main/common/helpers';
import { UpgradedSocketClient, upgradeSocketClient } from '../upgradeSocketClient';
import { ServiceClientIdEnum } from './types';

// const SERVICE_FILE_PATH = 'service/service-init.js';

export class WinServiceManager extends ServiceManager {
  private client: UpgradedSocketClient;
  async init(clientId = ServiceClientIdEnum.UI) {
    await waitFor(() => this.establishSocketServiceConnection(clientId));
  }

  sendMessage(type: unknown, payload?: unknown): void {
    this.client.write(
      JSON.stringify({
        type,
        payload,
      }) + '\n'
    );
  }

  async sendMessageWithAck(type: unknown, payload: unknown): Promise<unknown> {
    return this.client.writeWithAck({ type, payload });
  }

  emit(type: unknown, payload?: unknown) {
    this.messageHandlers.forEach((handler) => handler(type, payload));
  }

  private async establishSocketServiceConnection(clientId: ServiceClientIdEnum) {
    await new Promise((resolve, reject) => {
      const errorListener = (err) => {
        logger.debug('Error connecting to service %o', err);
        this.client?.destroy();
        reject();
      };

      this.client = upgradeSocketClient(
        net.connect({ port: SERVICE_SOCKET_PORT }, () => {
          logger.debug(`Connected to service on port ${SERVICE_SOCKET_PORT}`);

          this.sendMessage(ServiceMessageTypeEnum.SET_CLIENT_ID, clientId);

          this.client.on('data', (data) => {
            const parsedData = JSON.parse(data.toString());

            logger.debug('Received data from service %o', parsedData);

            this.emit(parsedData.type, parsedData.payload);
          });

          this.client.on('error', (e) => {
            logger.error('Service error: %o', e);
            this.emit(ServiceMessageTypeEnum.ERROR);
          });

          this.client.removeListener('error', errorListener);

          resolve(true);
        })
      );

      this.client.once('error', errorListener);
    });
  }

  async register() {
    logger.debug('Trying to register service', { prefix: WinServiceManager.name.toString() });
    // const { getResourcesFolderPath } = await import('../../main/helpers');
    // await new Promise((resolve, reject) => {
    // sudo.exec(
    //   `node "${path.join(getResourcesFolderPath(), SERVICE_FILE_PATH)}"`,
    //   { name: 'VoicePC' },
    //   function (error) {
    //     if (error) {
    //       console.log(error);
    //       reject();
    //     } else {
    //       resolve(undefined);
    //     }
    //   }
    // );
    // });
  }

  dispose() {
    this.messageHandlers = [];
    if (this.client) {
      this.client.destroy();
    }
  }
}
