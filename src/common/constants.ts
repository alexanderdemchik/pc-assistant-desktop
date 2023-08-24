import packageJson from '../../package.json';

export const APP_PROTOCOL = 'pc-manager';
export const APP_NAME = packageJson.productName;
export const APP_CONFIG_FILE = 'config.json';
export const YANDEX_CREDENTIALS = {
  REDIRECT_URI: 'https://pcmanager.aliaksandrdzemchyk.site/callback',
};

export const SERVICE_SOCKET_PORT = 8012;

export enum APP_FLAGS {
  AUTOLAUNCHED = '--hidden',
  NO_UI = '--noui',
}
