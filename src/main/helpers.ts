import { app, protocol, session } from 'electron';
import path from 'path';
import url from 'url';
import AutoLaunch from 'auto-launch';
import { logger } from './logger';
import { APP_NAME, APP_PROTOCOL } from '../constants';
import { handleAuthWithYandexToken } from './auth-manager';

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
            path:
                process.env.NODE_ENV === 'development'
                    ? path.normalize(`${app.getAppPath()}/${host + pathname}`)
                    : path.normalize(`${process.resourcesPath}/${host + pathname}`),
        });
    });
}

export function registerDeepLinksHandler() {
    if (process.env.NODE_ENV === 'development' && process.platform === 'win32') {
        // Set the path of electron.exe and your app.
        // These two additional parameters are only available on windows.
        // Setting this is required to get this working in dev mode.
        app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
    } else {
        app.setAsDefaultProtocolClient(APP_PROTOCOL);
    }

    app.on('open-url', function (event, url) {
        event.preventDefault();
        handleAuthWithYandexToken(url);
    });

    app.on('second-instance', (e, argv) => {
        if (process.platform !== 'darwin') {
            // Find the arg that is our custom protocol url and store it
            const url = argv.find((arg) => arg.startsWith(APP_PROTOCOL));
            handleAuthWithYandexToken(url);
        }
    });
}

export function setupAutolaunch() {
    const autoLauncher = new AutoLaunch({
        name: APP_NAME,
        isHidden: true,
    });

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
