const path = require('path');

module.exports = {
  entry: {
    bundle: './src/index.js',
    fib: './src/work/fib.js',
    fortyFifthFib: './src/work/fortyFifthFib.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.json', '.node']
  },
  output: {
    path: path.resolve(__dirname, 'public/js')
  }
};
