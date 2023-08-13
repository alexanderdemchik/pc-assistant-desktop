import type { Configuration } from 'webpack';
import path from 'path';
import nodeExternals from 'webpack-node-externals';

export default {
  entry: {
    service: './src/service/service.ts',
    'service-installer': './src/service/service-installer.ts',
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
  externals: [nodeExternals()],
  target: 'node',
} as Configuration;
