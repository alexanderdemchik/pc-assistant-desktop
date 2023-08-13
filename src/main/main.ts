process.env.FORCE_COLOR = 'true'; // required for chalk to work

import { app, BrowserWindow } from 'electron';
import { APP_FLAGS } from '../common/constants';
import { initConfig, updateConfigWithRemoteConfig } from './config';
import { registerLogger, logger } from './logger';
import {
  registerDeepLinksHandler,
  registerSchemesAsPrivileged,
  registerStaticProtocol,
  setupAutolaunch,
  setupCSP,
} from './helpers';
import * as trayManager from './tray';
import * as windowManager from './window';
import { setupRemoteCommandsReceiver } from './commands-receiver';
import * as authManager from './auth-manager';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isWithoutUI = process.argv.includes(APP_FLAGS.NO_UI);
const isAutoLaunched = process.argv.includes(APP_FLAGS.AUTOLAUNCHED);

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

registerLogger(process.env.LOG_LEVEL);
registerSchemesAsPrivileged();
registerDeepLinksHandler();

logger.debug(app.getVersion());

async function onReady() {
  setupCSP();

  registerStaticProtocol();

  await initConfig();
  await updateConfigWithRemoteConfig();

  setupAutolaunch();

  authManager.init();

  trayManager.create();

  windowManager.setupEventsListeners();
  setupRemoteCommandsReceiver();

  if (!isAutoLaunched) {
    windowManager.create();
  }
}

app.on('ready', onReady);

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.create();
  }
});

process.on('uncaughtException', (e) => {
  logger.error('%o', e);
});

process.on('unhandledRejection', (e) => {
  logger.error('%o', e);
});
