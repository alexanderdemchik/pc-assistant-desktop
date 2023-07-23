import { SERVICE_SOCKET_PORT } from '../../constants';
import { ServiceManager, ServiceSocketMessageTypeEnum } from './ServiceManager';
import net from 'net';
import sudo from '@vscode/sudo-prompt';
import { getResourcesFolderPath } from '../helpers';
import path from 'path';
import { logger } from '../logger';
import { config } from '../config';

const SERVICE_FILE_PATH = 'service/service-init.js';

export class WinServiceManager extends ServiceManager {
    private client: net.Socket;
    async init() {
        try {
            await this.establishSocketServiceConnection();
        } catch (e) {
            await this.register();

            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.establishSocketServiceConnection().then(resolve).catch(reject);
                }, 2000);
            });
        }

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
            this.client = net.connect({ port: SERVICE_SOCKET_PORT }, function () {
                logger.debug(`Connected to service on port ${SERVICE_SOCKET_PORT}`);

                resolve(true);
            });

            this.client.once('error', (err) => {
                logger.debug('Error connecting to service %o', err);
                reject();
            });

            this.client.on('connect', () => {
                this.client.write(
                    JSON.stringify({
                        type: ServiceSocketMessageTypeEnum.CONFIG,
                        payload: config,
                    })
                );
            });

            this.client.on('data', (data) => {
                const parsedData = JSON.parse(data.toString());

                logger.debug('Received data from service %o', parsedData, { prefix: WinServiceManager.name });

                this.emit(parsedData.type, parsedData);
            });
        });
    }

    async register() {
        logger.debug('Trying to register service', { prefix: WinServiceManager.name });
        await new Promise((resolve, reject) => {
            sudo.exec(
                `node "${path.join(getResourcesFolderPath(), SERVICE_FILE_PATH)}"`,
                { name: 'VoicePC' },
                function (error, stdout, stderr) {
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
