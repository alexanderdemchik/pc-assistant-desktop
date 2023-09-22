import type { Configuration } from 'webpack';
import path from 'path';
import base from './webpack.config.base';
import nodeExternals from 'webpack-node-externals';

export default {
  entry: {
    service: './src/service/service.ts',
    'service-installer': './src/service/service-installer.ts',
    'desktop-change-listener': './src/service/action-executor/desktop-change-listener.ts',
    'action-executor': './src/service/action-executor/index.ts',
  },
  output: {
    path: path.resolve(__dirname, '../.webpack'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  externalsType: 'commonjs',
  externalsPresets: { node: true },
  //@ts-ignore
  externals: [nodeExternals(), ...base.externals],
  target: 'node',
} as Configuration;
