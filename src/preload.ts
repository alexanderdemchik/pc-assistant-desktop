// See the Electron documentation for details on how to use preload scripts:
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('API', {
    onYandexAuthSuccess: (callback: () => void) => {
        ipcRenderer.on('yandex-auth-success', callback);
    },
    getAuthState: async () => {
        return ipcRenderer.invoke('get-auth-state');
    }
});
