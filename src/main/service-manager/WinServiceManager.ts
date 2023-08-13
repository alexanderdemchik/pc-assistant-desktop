import { SERVICE_SOCKET_PORT } from '../../common/constants';
import { ServiceManager, ServiceSocketMessageTypeEnum } from './ServiceManager';
import net from 'net';
import sudo from '@vscode/sudo-prompt';
import { getResourcesFolderPath } from '../helpers';
import path from 'path';
import { logger } from '../logger';
import { config } from '../config';
import { waitFor } from '../common/helpers';

const SERVICE_FILE_PATH = 'service/service-init.js';

export class WinServiceManager extends ServiceManager {
  private client: net.Socket;
  async init() {
    await waitFor(() => this.establishSocketServiceConnection());

    this.on(ServiceSocketMessageTypeEnum.CONFIG, (config) => {
      this.client.write(
        JSON.stringify({
          type: ServiceSocketMessageTypeEnum.CONFIG,
          payload: config,
        })
      );
    });
  }

  private async establishSocketServiceConnection() {
    await new Promise((resolve, reject) => {
      const errorListener = (err) => {
        logger.debug('Error connecting to service %o', err);
        this.client?.destroy();
        reject();
      };

      this.client = net.connect({ port: SERVICE_SOCKET_PORT }, () => {
        logger.debug(`Connected to service on port ${SERVICE_SOCKET_PORT}`);

        this.client.on('data', (data) => {
          const parsedData = JSON.parse(data.toString());

          logger.debug('Received data from service %o', parsedData, { prefix: WinServiceManager.name.toString() });

          this.emit(parsedData.type, parsedData);
        });

        this.client.on('error', (e) => {
          logger.error('Service error: %o', e);
          this.emit(ServiceSocketMessageTypeEnum.ERROR);
        });

        this.client.removeListener('error', errorListener);
        this.client.write(
          JSON.stringify({
            type: ServiceSocketMessageTypeEnum.CONFIG,
            payload: config,
          })
        );

        resolve(true);
      });

      this.client.once('error', errorListener);
    });
  }

  async register() {
    logger.debug('Trying to register service', { prefix: WinServiceManager.name.toString() });
    await new Promise((resolve, reject) => {
      sudo.exec(
        `node "${path.join(getResourcesFolderPath(), SERVICE_FILE_PATH)}"`,
        { name: 'VoicePC' },
        function (error) {
          if (error) {
            console.log(error);
            reject();
          } else {
            resolve(undefined);
          }
        }
      );
    });
  }

  dispose() {
    if (this.client) {
      this.client.destroy();
    }
    this.removeAllListeners();
  }
}
