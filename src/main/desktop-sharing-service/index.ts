import { BrowserWindow, app, desktopCapturer, ipcMain } from 'electron';
import path from 'path';
import { resolveDesktopSharingPath } from '../util';
import { IpcEventNamesEnum } from '../../common/types/ipcEventsNames.enum';

let instance;

export async function init() {
  instance = new BrowserWindow({
    width: 600,
    minWidth: 600,
    minHeight: 600,
    height: 600,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../../release/app/dist/preload/preload.js'),
      contextIsolation: false,
    },
    backgroundColor: '#121212',
  });

  instance.setMenu(null);

  await instance.loadURL(resolveDesktopSharingPath());

  ipcMain.handle(IpcEventNamesEnum.GET_SOURCES, async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });

    return sources.map((el) => el.id);
  });
}
