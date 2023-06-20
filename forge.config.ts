import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';
import { APP_NAME, APP_PROTOCOL } from './src/constants';
import path from 'path';

const config: ForgeConfig = {
    packagerConfig: {
        name: APP_NAME,
        extraResource: ['static'],
        asar: false,
        protocols: [
            {
                name: APP_PROTOCOL,
                schemes: [APP_PROTOCOL],
            },
        ],
        icon: './static/icons/app_icon',
    },
    rebuildConfig: {},
    makers: [
        new MakerSquirrel({
            setupIcon: './static/icons/app_icon.ico',
            iconUrl: 'https://raw.githubusercontent.com/alexanderdemchik/pc-manager-desktop/master/static/icons/app_icon.ico',
        }),
        new MakerZIP({}, ['darwin']),
        new MakerRpm({}),
        new MakerDeb({}),
    ],
    plugins: [
        new WebpackPlugin({
            mainConfig,
            port: 3001,
            loggerPort: 3002,
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: './src/index.html',
                        js: './src/renderer.tsx',
                        name: 'main_window',
                        preload: {
                            js: './src/preload.ts',
                        },
                    },
                ],
            },
        }),
    ],
};

export default config;
