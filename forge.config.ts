import type { ForgeConfig } from "@electron-forge/shared-types"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { MakerZIP } from "@electron-forge/maker-zip"
import { MakerDeb } from "@electron-forge/maker-deb"
import { MakerRpm } from "@electron-forge/maker-rpm"
import { WebpackPlugin } from "@electron-forge/plugin-webpack"
import { mainConfig } from "./webpack.main.config"
import { rendererConfig } from "./webpack.renderer.config"
import { APP_PROTOCOL } from "./src/constants"

const config: ForgeConfig = {
    packagerConfig: {
        name: "Alice PC Manager",
        extraResource: ["package.json"],
        asar: false,
        protocols: [
            {
                name: APP_PROTOCOL,
                schemes: [APP_PROTOCOL],
            },
        ],
    },
    rebuildConfig: {},
    makers: [
        new MakerSquirrel({}),
        new MakerZIP({}, ["darwin"]),
        new MakerRpm({}),
        new MakerDeb({}),
    ],
    plugins: [
        new WebpackPlugin({
            mainConfig,
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: "./src/index.html",
                        js: "./src/renderer.tsx",
                        name: "main_window",
                        preload: {
                            js: "./src/preload.ts",
                        },
                    },
                ],
            },
        }),
    ],
}

export default config
