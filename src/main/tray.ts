import { Menu, Tray, app } from 'electron';
import { getResourcesFolderPath } from './helpers';
import path from 'path';
import * as windowmanager from './window';
import { APP_NAME } from '../common/constants';
import { remoteCommandsReceiver } from './commands-receiver';

export let instance: Tray;

export function create() {
  if (!instance) {
    instance = new Tray(path.join(getResourcesFolderPath(), getAppIconPath()));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Сменить пользователя',
        click: () => {
          // ws.destroy();
          windowmanager.create();
        },
      },
      {
        label: 'Выход',
        click() {
          app.quit();
        },
      },
    ]);
    instance.setToolTip(APP_NAME);
    instance.setContextMenu(contextMenu);

    instance.on('click', () => {
      if (!remoteCommandsReceiver.getState().connected && remoteCommandsReceiver.getState().error) {
        windowmanager.create();
      }
    });
  }
}

function getAppIconPath() {
  switch (process.platform) {
    case 'win32':
      return './assets/icons/app_icon.ico';
    case 'darwin':
      return './assets/icons/app_icon.icns';
    case 'linux':
      return './assets/icons/app_icon.png';
  }
}
