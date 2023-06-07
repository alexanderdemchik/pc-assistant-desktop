import path from 'path';
import { open, writeFile } from 'fs/promises';
import { APP_CONFIG_FILE } from '../constants';
import { app } from 'electron';
import { randomUUID } from 'crypto';

interface IConfig {
    deviceId?: string;
    token?: string;
    [key: string]: string;
}

let config: IConfig = null;

export async function getConfig() {
    if (!config) {
        const configFilePath = path.join(app.getAppPath(), APP_CONFIG_FILE);
        let descriptor;
        try {
            descriptor = await open(configFilePath);
            config = JSON.parse(await descriptor.readFile({ encoding: 'utf-8' }));
        } catch (e) {
            if (e.code === 'ENOENT') {
                config = { deviceId: randomUUID() };
                await writeFile(configFilePath, JSON.stringify(config, null, 2));
            }
        } finally {
            await descriptor?.close();
        }
    }

    return config;
}

export async function updateConfigValue(key: string, value: string) {
    console.log(key);
    console.log(value);
    const config = await getConfig();

    config[key] = value;

    const configFilePath = path.join(app.getAppPath(), APP_CONFIG_FILE);
    console.log(configFilePath);
    await writeFile(configFilePath, JSON.stringify(config, null, 2));
}
