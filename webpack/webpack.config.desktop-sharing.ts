/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import deleteSourceMaps from '../scripts/delete-source-maps';

deleteSourceMaps();

const configuration: webpack.Configuration = {
  devtool: 'source-map',
  mode: 'development',
  target: ['web'],
  entry: [path.join(webpackPaths.srcMainPath, 'desktop-sharing-service/window.ts')],
  output: {
    path: webpackPaths.distRendererPath,
    publicPath: './',
    filename: 'desktop-sharing.js',
    library: {
      type: 'umd',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'desktop-sharing.html',
      template: path.join(webpackPaths.srcRendererPath, 'index.html'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      isBrowser: false,
      isDevelopment: false,
    }),

    new webpack.DefinePlugin({
      'process.type': '"desktop-sharing"',
    }),
  ],
  watch: true,
};

export default merge(baseConfig, configuration);
