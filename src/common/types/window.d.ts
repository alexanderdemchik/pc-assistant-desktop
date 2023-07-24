import { IpcRenderer } from 'electron';

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    YaAuthSuggest: any;
  }

  const ipcRenderer: IpcRenderer;
  const YaAuthSuggest: any;
}

export {};
