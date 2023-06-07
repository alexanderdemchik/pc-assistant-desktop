import { app, BrowserWindow, ipcMain, protocol, session, shell } from 'electron';
import path from 'path';
import url from 'url';
import { APP_PROTOCOL, SERVER_URL } from './constants';
import { getConfig } from './main/config.helper';
import axios from 'axios';
import { initSocketConnection } from './main/socket.helper';
import { handleAuthWithYandexToken } from './main/auth.helper';

const IS_DEV = process.env.NODE_ENV === 'development';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}
if (IS_DEV && process.platform === 'win32') {
    // Set the path of electron.exe and your app.
    // These two additional parameters are only available on windows.
    // Setting this is required to get this working in dev mode.
    app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
} else {
    app.setAsDefaultProtocolClient(APP_PROTOCOL);
}

app.on('open-url', function (event, url) {
    event.preventDefault();
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (e, argv) => {
        if (process.platform !== 'darwin') {
            // Find the arg that is our custom protocol url and store it
            const url = argv.find((arg) => arg.startsWith(APP_PROTOCOL));
            handleAuthWithYandexToken(url);
        }
    });
}

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'static',
        privileges: {
            stream: true,
            bypassCSP: true,
        },
    },
]);
const createWindow = async () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            //@ts-ignore
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    mainWindow.setMenu(null);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // and load the index.html of the app.
    //@ts-ignore
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

async function onReady() {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://mc.yandex.ru https://yastatic.net",
                ],
            },
        });
    });

    protocol.registerFileProtocol('static', (request, callback) => {
        const { host, pathname } = url.parse(request.url);

        callback({
            path: path.normalize(`${app.getAppPath()}/${host + pathname}`),
        });
    });

    ipcMain.handle('get-auth-state', async () => {
        console.log('get-auth-state');
        const token = (await getConfig()).token;

        if (token) {
            try {
                await axios.get(`${SERVER_URL}/user`, { headers: { Authorization: `Bearer ${token}` } });
                initSocketConnection(token);
                return true;
            } catch (e) {
                return false;
            }
        }

        return false;
    });

    createWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', onReady);
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
