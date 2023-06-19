process.env.FORCE_COLOR = 'true'; // required for chalk to work

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { APP_PROTOCOL } from './constants';
import { config, initConfig, updateConfigWithRemoteConfig } from './main/config';
import * as ws from './main/ws';
import { handleAuthWithYandexToken } from './main/auth';
import { initMainLogger, logger } from './main/logger';
import { registerSchemesAsPrivileged, registerStaticProtocol, setupAutolaunch, setupCSP } from './main/helpers';
import * as trayManager from './main/tray';
import * as windowManager from './main/window';
import { eventsManager } from './main/events';
import { EventsNamesEnum } from './types/eventsNames.enum';
import { IpcEventNamesEnum } from './types/ipcEventsNames.enum';

const IS_DEV = process.env.NODE_ENV === 'development';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

if (IS_DEV && process.platform === 'win32') {
    // Set the path of electron.exe and your app.
    // These two additional parameters are only available on windows.
    // Setting this is required to get this working in dev mode.
    app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
} else {
    app.setAsDefaultProtocolClient(APP_PROTOCOL);
}

registerSchemesAsPrivileged();

app.on('open-url', function (event, url) {
    event.preventDefault();
    handleAuthWithYandexToken(url);
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (e, argv) => {
        if (process.platform !== 'darwin') {
            // Find the arg that is our custom protocol url and store it
            const url = argv.find((arg) => arg.startsWith(APP_PROTOCOL));
            handleAuthWithYandexToken(url);
        }
        windowManager.instance?.focus();
    });
}

async function onReady() {
    setupCSP();

    registerStaticProtocol();

    await initConfig();
    await initMainLogger(config.logLevel);
    await updateConfigWithRemoteConfig();

    setupAutolaunch();

    trayManager.create();

    if (config.token) {
        ws.init();
    } else {
        windowManager.create();
        ipcMain.emit(IpcEventNamesEnum.REQUIRE_AUTH);
    }

    eventsManager.on(EventsNamesEnum.WS_CONNECTED, () => {
        logger.debug('WS Connected');
        windowManager.emit(IpcEventNamesEnum.CONNECTED);
    });

    eventsManager.on(EventsNamesEnum.WS_CONNECT_ERROR, () => {
        windowManager.create();
        windowManager.emit(IpcEventNamesEnum.REQUIRE_AUTH);
    });

    ipcMain.handle(IpcEventNamesEnum.GET_CONNECTION_STATUS, () => {
        return { connected: ws.isConnected, loading: ws.isConnecting };
    });

    ipcMain.handle(IpcEventNamesEnum.GET_CONFIG, () => {
        return config;
    });
}

app.on('ready', onReady);

app.on('window-all-closed', () => {});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        windowManager.create();
    }
});
