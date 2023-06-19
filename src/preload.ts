// See the Electron documentation for details on how to use preload scripts:
import { contextBridge, ipcRenderer } from 'electron';
import { IpcEventNamesEnum } from './types/ipcEventsNames.enum';

const sendLogByIPC = (level: 'info' | 'debug' | 'error') => {
    return (...args: any[]) => {
        ipcRenderer.send('log', level, ...args);
    };
};

contextBridge.exposeInMainWorld('API', {
    onConnected: (callback: () => void) => {
        ipcRenderer.on(IpcEventNamesEnum.CONNECTED, callback);
    },
    onRequireAuth: (callback: () => void) => {
        ipcRenderer.on(IpcEventNamesEnum.REQUIRE_AUTH, callback);
    },
    getConnectionStatus: () => {
        return ipcRenderer.invoke(IpcEventNamesEnum.GET_CONNECTION_STATUS);
    },
    getConfig: () => {
        return  ipcRenderer.invoke(IpcEventNamesEnum.GET_CONFIG)
    },
    sendLogByIPC,
});
