// See the Electron documentation for details on how to use preload scripts:
import { IpcEventNamesEnum } from '../common/types/ipcEventsNames.enum';

export const sendLogByIPC = (level: 'info' | 'debug' | 'error') => {
  return (...args: any[]): void => {
    window.ipcRenderer.send('log', level, ...args);
  };
};

export const eventsManager = window.ipcRenderer;
export const getConnectionStatus = (): Promise<any> => {
  return window.ipcRenderer.invoke(IpcEventNamesEnum.GET_CONNECTION_STATUS);
};
export const getConfig = (): Promise<any> => {
  return window.ipcRenderer.invoke(IpcEventNamesEnum.GET_CONFIG);
};
