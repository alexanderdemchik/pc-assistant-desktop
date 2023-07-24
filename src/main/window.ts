import { BrowserWindow, app, ipcMain, shell } from 'electron';
import { EventsNamesEnum, eventsManager } from './events';
import { IpcEventNamesEnum } from '../common/types/ipcEventsNames.enum';
import { remoteCommandsReceiver } from './commands-receiver';
import { config } from './config';
import { isAuthorized } from './auth-manager';
import { resolveHtmlPath } from './util';
import path from 'path';

export let instance: BrowserWindow;

export function setupEventsListeners() {
  eventsManager.on(EventsNamesEnum.AUTH_REQUIRED, async () => {
    await create();
    emit(IpcEventNamesEnum.AUTH_REQUIRED);
  });

  eventsManager.on(EventsNamesEnum.TOKEN_RECEIVED, () => {
    this.emit(IpcEventNamesEnum.AUTH_SUCCESS);
    instance?.focus();
  });

  eventsManager.on(EventsNamesEnum.CONNECTED, () => {
    this.emit(IpcEventNamesEnum.CONNECTED);
  });

  ipcMain.handle(IpcEventNamesEnum.GET_CONNECTION_STATUS, () => {
    const { connected } = remoteCommandsReceiver.getState();
    return { connected: connected, authorized: isAuthorized };
  });

  ipcMain.handle(IpcEventNamesEnum.GET_CONFIG, () => {
    return config;
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
