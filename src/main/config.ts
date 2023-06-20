import path from 'path';
import { open, writeFile } from 'fs/promises';
import { APP_CONFIG_FILE } from '../constants';
import { app } from 'electron';
import { randomUUID } from 'crypto';
import defaultDevConfig from '../../config/development.json';
import defaultProdConfig from '../../config/production.json';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { logger } from './logger';

interface IConfig {
    deviceId?: string;
    token?: string;
    [key: string]: string;
}

export let config: IConfig = null;

export async function initConfig() {
    const defaultConfig = process.env.NODE_ENV === 'development' ? defaultDevConfig : defaultProdConfig;

    if (!config) {
        const configFilePath = path.join(process.resourcesPath, APP_CONFIG_FILE);
        let descriptor;
        try {
            descriptor = await open(configFilePath);
            config = JSON.parse(await descriptor.readFile({ encoding: 'utf-8' }));
            await writeFile(configFilePath, JSON.stringify({ ...defaultConfig, ...config }, null, 2));
        } catch (e) {
            if (e.code === 'ENOENT') {
                config = { ...defaultConfig, deviceId: randomUUID() };
                await writeFile(configFilePath, JSON.stringify(config, null, 2));
            }
        } finally {
            await descriptor?.close();
        }
    }

    return config;
}

export async function updateConfigValue(key: string, value: string) {
    config[key] = value;

    const configFilePath = path.join(process.resourcesPath, APP_CONFIG_FILE);

    await writeFile(configFilePath, JSON.stringify(config, null, 2));
}

export async function updateConfigWithRemoteConfig() {
    try {
        // Initialize Firebase
        const firebase = initializeApp({
            apiKey: 'AIzaSyDgpp9K3gzrFpIgOYNp0M1FgkrJWLSuL9s',
            authDomain: 'pc-manager-2a4d9.firebaseapp.com',
            projectId: 'pc-manager-2a4d9',
            storageBucket: 'pc-manager-2a4d9.appspot.com',
            messagingSenderId: '137877908271',
            appId: '1:137877908271:web:9371fcd147214f855ecfda',
        });

        // Initialize Cloud Firestore and get a reference to the service
        const db = getFirestore(firebase);

        const docRef = doc(db, 'config', 'production');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let remoteConfig = docSnap.data();

            logger.info('Received remote config %o', remoteConfig);

            config = { ...config, ...remoteConfig };

            const configFilePath = path.join(process.resourcesPath, APP_CONFIG_FILE);

            await writeFile(configFilePath, JSON.stringify(config, null, 2));
        }
    } catch (e) {
        logger.error('Error to update config with remote config: %e', e);
    }
}
