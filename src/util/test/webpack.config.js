const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    arguments: path.resolve(__dirname, './arguments.js'),
    boolean: path.resolve(__dirname, './boolean.js'),
    number: path.resolve(__dirname, './number.js'),
    string: path.resolve(__dirname, './string.js'),
    named: path.resolve(__dirname, './named.js'),
    types: path.resolve(__dirname, './types.js')
  },
  resolve: {
    extensions: ['.js']
  },
  output: {
    path: path.resolve(__dirname, './modules')
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          compress: {
            negate_iife: false,
            side_effects: false
          }
        }
      })
    ]
  }
};
