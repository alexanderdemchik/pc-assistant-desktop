import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
//@ts-ignore
import path from 'path';
import nodeExternals from 'webpack-node-externals';

export default {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: './src/main.ts',
    target: 'electron-main',
    output: {
        //@ts-ignore
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
        clean: true,
    },
    // Put your normal webpack config below here
    module: {
        rules,
    },
    externals: [nodeExternals()],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    },
};
