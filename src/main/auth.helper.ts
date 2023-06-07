import axios from 'axios';
import { SERVER_URL } from '../constants';
import { updateConfigValue } from './config.helper';
import { ipcMain } from 'electron';
import { initSocketConnection } from './socket.helper';

export async function handleAuthWithYandexToken(yredirecturl: string) {
    const tokenExtractionRegex = /access_token=(.*?)&/g;

    const accessToken = tokenExtractionRegex.exec(yredirecturl)[1];
    console.log(accessToken);
    try {
        const res = await axios.post(`${SERVER_URL}/auth/yandex`, { accessToken });
        console.log(res.data);
        const token: string = res.data.accessToken;
        await updateConfigValue('token', token);

        ipcMain.emit('yandex-auth-success');

        await initSocketConnection(token);

        return token;
    } catch (e) {
        ipcMain.emit('yandex-auth-error');
    }

    return null;
}
