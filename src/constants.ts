import packageJson from '../package.json';

export const APP_PROTOCOL = 'pc-manager';
export const APP_NAME = packageJson.productName;
export const APP_CONFIG_FILE = 'config.json';
export const YANDEX_CREDENTIALS = {
    REDIRECT_URI: `${APP_PROTOCOL}://`,
};
