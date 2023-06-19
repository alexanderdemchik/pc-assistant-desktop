import { BrowserWindow, shell } from 'electron';

export let instance: BrowserWindow;

export const create = async () => {
    if (!instance) {
        // Create the browser window.
        instance = new BrowserWindow({
            width: 600,
            minWidth: 600,
            minHeight: 600,
            height: 600,
            webPreferences: {
                //@ts-ignore
                preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            },
        });

        instance.setMenu(null);

        instance.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });

        // and load the index.html of the app.
        //@ts-ignore
        instance.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

        instance.on('closed', () => {
            instance = null;
        })

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
