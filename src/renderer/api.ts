// See the Electron documentation for details on how to use preload scripts:
import { IAppInfo } from '../common/types/IAppInfo';
import { IConnectionState } from '../common/types/IConnectionState';
import { IpcEventNamesEnum } from '../common/types/ipcEventsNames.enum';
import { ICacheCommandLogEntry } from '../main/cache-manager/types';
import { IConfig } from '../main/common/types';

export const sendLogByIPC = (level: 'info' | 'debug' | 'error') => {
  return (...args: any[]): void => {
    window.ipcRenderer.send('log', level, ...args);
  };
};

export const eventsManager = window.ipcRenderer;

export const getConnectionStatus = (): Promise<IConnectionState> => {
  return window.ipcRenderer.invoke(IpcEventNamesEnum.GET_CONNECTION_STATUS);
};

export const getConfig = (): Promise<IConfig> => {
  return window.ipcRenderer.invoke(IpcEventNamesEnum.GET_CONFIG);
};

export const getAppInfo = (): Promise<IAppInfo> => {
  return window.ipcRenderer.invoke(IpcEventNamesEnum.GET_APP_INFO);
};

export const getCommandsLog = (): Promise<ICacheCommandLogEntry[]> => {
  return window.ipcRenderer.invoke(IpcEventNamesEnum.GET_COMMANDS_LOG);
};

export const getSources = (): Promise<string[]> => {
  return window.ipcRenderer.invoke(IpcEventNamesEnum.GET_SOURCES);
};
