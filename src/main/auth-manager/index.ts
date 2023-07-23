import axios from 'axios';
import { config, updateConfigValue } from '../config';
import { EventsNamesEnum, eventsManager } from '../events';

export let isAuthorized = false;

export function init() {
    isAuthorized = !!config.token;
    eventsManager.on(EventsNamesEnum.AUTH_REQUIRED, () => {
        isAuthorized = false;
    });
}

export async function handleAuthWithYandexToken(yredirecturl: string) {
    const tokenExtractionRegex = /access_token=(.*?)&/g;
    const accessToken = tokenExtractionRegex.exec(yredirecturl)[1];

    try {
        const res = await axios.post(`${config.serverUrl}/auth/yandex`, { accessToken });

        const token: string = res.data.accessToken;
        await updateConfigValue('token', token);

        eventsManager.emit(EventsNamesEnum.TOKEN_RECEIVED, token);

        isAuthorized = true;

        return token;
    } catch (e) {
        eventsManager.emit(EventsNamesEnum.TOKEN_RECEIVE_ERROR);
    }

    return null;
}
