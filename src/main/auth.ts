import axios from 'axios';
import { config, updateConfigValue } from './config';
import { ipcMain } from 'electron';
import * as ws from './ws';

export async function handleAuthWithYandexToken(yredirecturl: string) {
    const tokenExtractionRegex = /access_token=(.*?)&/g;
    const accessToken = tokenExtractionRegex.exec(yredirecturl)[1];

    try {
        const res = await axios.post(`${config.serverUrl}/auth/yandex`, { accessToken });

        const token: string = res.data.accessToken;
        await updateConfigValue('token', token);

        ws.init();

        return token;
    } catch (e) {
        ipcMain.emit('auth-error');
    }

    return null;
}
