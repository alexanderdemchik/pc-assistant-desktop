import { BrowserWindow, app, ipcMain, shell } from 'electron';
import { EventsNamesEnum, eventsManager } from './events';
import { IpcEventNamesEnum } from '../common/types/ipcEventsNames.enum';
import { config } from './config';
import { isAuthorized, isLoading } from './auth-manager';
import { resolveHtmlPath } from './util';
import path from 'path';
import { IConnectionState } from '../common/types/IConnectionState';
import { logger } from './logger';
import { cacheManager, connected } from '../main/app-manager';

export let instance: BrowserWindow;

export function notifyStateChange() {
  const state: IConnectionState = { connected, authorized: isAuthorized, loading: isLoading };

  logger.debug('notifyStateChange: %o', state);

  emit(IpcEventNamesEnum.STATE_CHANGE, state);
}

export function setupEventsListeners() {
  eventsManager.on(EventsNamesEnum.AUTH_REQUIRED, async () => {
    await create();
    notifyStateChange();
  });

  eventsManager.on(EventsNamesEnum.TOKEN_RECEIVED, () => {
    notifyStateChange();
    instance?.focus();
  });

  eventsManager.on(EventsNamesEnum.REMOTE_CONNECTION_STATE_CHANGE, () => {
    notifyStateChange();
  });

  eventsManager.on(EventsNamesEnum.DISCONNECTED, () => {
    notifyStateChange();
  });

  ipcMain.handle(IpcEventNamesEnum.GET_COMMANDS_LOG, () => {
    return cacheManager.get('commandsLog');
  });

  ipcMain.handle(IpcEventNamesEnum.GET_CONNECTION_STATUS, () => {
    return { connected: connected, authorized: isAuthorized, loading: isLoading } as IConnectionState;
  });

  ipcMain.handle(IpcEventNamesEnum.GET_CONFIG, () => {
    return config;
  });

  ipcMain.handle(IpcEventNamesEnum.GET_APP_INFO, () => {
    return {
      version: app.getVersion(),
      name: app.getName(),
    };
  });
}

export const create = async () => {
  if (!instance) {
    // Create the browser window.
    instance = new BrowserWindow({
      width: 600,
      minWidth: 600,
      minHeight: 600,
      height: 600,
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../release/app/dist/preload/preload.js'),
        contextIsolation: false,
      },
      backgroundColor: '#121212',
    });

    instance.setMenu(null);

    instance.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // and load the index.html of the app.
    //@ts-ignore
    await instance.loadURL(resolveHtmlPath('index.html'));

    instance.on('closed', () => {
      instance = null;
    });

    if (process.env.NODE_ENV === 'development') {
      instance.webContents.openDevTools();
    }
  } else {
    instance.focus();
  }
};

export const emit = (eventName: string, ...args: any[]) => {
  instance?.webContents?.send(eventName, ...args);
};

export const destroy = () => {
  instance?.destroy();
  instance = null;
};
