import { app, protocol, session } from 'electron';
import path from 'path';
import url from 'url';
import AutoLaunch from 'auto-launch';
import { logger } from './logger';
import { APP_NAME } from '../constants';

export function getResourcesFolderPath() {
    return process.env.NODE_ENV === 'production' ? process.resourcesPath : app.getAppPath();
}

export function setupCSP() {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://mc.yandex.ru https://yastatic.net",
                ],
            },
        });
    });
}

export function registerSchemesAsPrivileged() {
    protocol.registerSchemesAsPrivileged([
        {
            scheme: 'res',
            privileges: {
                stream: true,
                bypassCSP: true,
            },
        },
    ]);
}

export function registerStaticProtocol() {
    protocol.registerFileProtocol('res', (request, callback) => {
        const { host, pathname } = url.parse(request.url);
        callback({
            path: process.env.NODE_ENV === 'development' ? path.normalize(`${app.getAppPath()}/${host + pathname}`) : path.normalize(`${process.resourcesPath}/${host + pathname}`),
        });
    });
}

export function setupAutolaunch() {
    const autoLauncher = new AutoLaunch({
        name: APP_NAME,
    });

    autoLauncher.enable();

    autoLauncher
        .isEnabled()
        .then((isEnabled: boolean) => {
            if (isEnabled) {
                return;
            }
            autoLauncher.enable();
        })
        .catch((err: Error) => {
            logger.error('auto-launch error %o', err);
        });
}
