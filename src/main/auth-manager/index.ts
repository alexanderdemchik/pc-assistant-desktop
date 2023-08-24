import axios from 'axios';
import { config, updateConfigValue } from '../config';
import { EventsNamesEnum, eventsManager } from '../events';
import { logger } from '../logger';

export let isAuthorized = false;
export let isLoading = false;

export function init() {
  isAuthorized = !!config.token;
  eventsManager.on(EventsNamesEnum.AUTH_REQUIRED, () => {
    isAuthorized = false;
  });
}

export async function handleAuthWithYandexToken(yredirecturl: string) {
  logger.debug('handleAuthWithYandexToken');
  const tokenExtractionRegex = /access_token=(.*?)&/g;
  const accessToken = tokenExtractionRegex.exec(yredirecturl)[1];

  try {
    isLoading = true;
    const res = await axios.post(`${config.serverUrl}/auth/yandex`, { accessToken });

    const token: string = res.data.accessToken;
    await updateConfigValue('token', token);

    isAuthorized = true;
    isLoading = false;

    eventsManager.emit(EventsNamesEnum.TOKEN_RECEIVED, token);

    return token;
  } catch (e) {
    logger.error('%e', e);
    isLoading = false;

    eventsManager.emit(EventsNamesEnum.TOKEN_RECEIVE_ERROR);
  }

  return null;
}

export function changeUser() {
  isAuthorized = false;

  updateConfigValue('token', undefined);

  eventsManager.emit(EventsNamesEnum.AUTH_REQUIRED);
}
