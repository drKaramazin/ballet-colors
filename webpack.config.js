const webpack = require('webpack');
const path = require('path');
const packageFile = require('./package.json');

const esConfig = {
  entry: './src/lib/index.ts',
  devtool: 'source-map',
  module: {
    rules: [{
      use: [{
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.json',
        },
      }],
      test: /\.ts?$/,
      exclude: /node_modules/,
    }],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.es.js',
    path: path.resolve(__dirname, 'lib'),
    library: {
      type: 'module',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageFile.version),
    }),
  ],
  watchOptions: {
    ignored: /node_modules/,
  },
  experiments: {
    outputModule: true,
  },
};

module.exports = esConfig;
