process.env.FORCE_COLOR = 'true'; // required for chalk to work

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { APP_FLAGS, APP_PROTOCOL } from './constants';
import { config, initConfig, updateConfigWithRemoteConfig } from './main/config';
import { registerLogger, logger } from './main/logger';
import {
    registerDeepLinksHandler,
    registerSchemesAsPrivileged,
    registerStaticProtocol,
    setupAutolaunch,
    setupCSP,
} from './main/helpers';
import * as trayManager from './main/tray';
import * as windowManager from './main/window';
import { setupRemoteCommandsReceiver } from './main/commands-receiver';
import * as authManager from './main/auth-manager';

const isWithoutUI = process.argv.includes(APP_FLAGS.NO_UI);
const isAutoLaunched = process.argv.includes(APP_FLAGS.AUTOLAUNCHED);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
}

registerSchemesAsPrivileged();
registerDeepLinksHandler();
registerLogger(process.env.LOG_LEVEL);

logger.debug(app.getVersion());

async function onReady() {
    setupCSP();

    registerStaticProtocol();

    await initConfig();
    await updateConfigWithRemoteConfig();

    setupAutolaunch();

    authManager.init();

    trayManager.create();

    setupRemoteCommandsReceiver();
    windowManager.setupEventsListeners();

    if (!isAutoLaunched && !authManager.isAuthorized) {
        windowManager.create();
    }
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
