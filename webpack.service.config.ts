import type { Configuration } from 'webpack';
//@ts-ignore
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';


export default {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: {
        'service-init': './src/service/serviceInit.ts',
        service: './src/service/service.ts',
        nut: './src/service/nut.ts',
    },
    output: {
        // @ts-ignore
        path: path.resolve(__dirname, 'service'),
        filename: '[name].js',
    },
    // Put your normal webpack config below here
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|\.webpack)/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    },
                },
            }
        ],
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    },
    externals: {
        
        'node-windows': "require('./node-windows/lib/node-windows.js')",
        '@nut-tree/nut-js': "require('./@nut-tree/nut-js/dist/index.js')",
        native: "require('../../../native/example.js')",
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: './node_modules/node-windows', to: './node-windows' },
                { from: './node_modules/@nut-tree', to: './@nut-tree' },
            ],
        }),
    ],
    target: 'node',
} as Configuration;
