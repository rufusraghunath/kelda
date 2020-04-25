const path = require('path');

module.exports = {
  entry: {
    arguments: path.resolve(__dirname, './arguments.js'),
    boolean: path.resolve(__dirname, './boolean.js'),
    number: path.resolve(__dirname, './number.js'),
    string: path.resolve(__dirname, './string.js')
  },
  resolve: {
    extensions: ['.js']
  },
  optimization: {
    minimize: false
  },
  output: {
    path: path.resolve(__dirname, './modules')
  }
};
