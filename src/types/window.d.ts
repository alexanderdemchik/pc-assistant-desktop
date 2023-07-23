import { IpcRenderer } from 'electron';

declare global {
    interface Window {
        ipcRenderer: IpcRenderer;
    }

    const ipcRenderer: IpcRenderer;
}

export {};
