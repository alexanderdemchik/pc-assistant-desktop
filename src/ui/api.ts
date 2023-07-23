// See the Electron documentation for details on how to use preload scripts:
import { IpcEventNamesEnum } from '../types/ipcEventsNames.enum';

export const sendLogByIPC = (level: 'info' | 'debug' | 'error') => {
    return (...args: any[]) => {
        window.ipcRenderer.send('log', level, ...args);
    };
};

export const eventsManager = window.ipcRenderer;
export const getConnectionStatus = () => {
    return window.ipcRenderer.invoke(IpcEventNamesEnum.GET_CONNECTION_STATUS);
};
export const getConfig = () => {
    return window.ipcRenderer.invoke(IpcEventNamesEnum.GET_CONFIG);
};
