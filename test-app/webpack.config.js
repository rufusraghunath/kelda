const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    bundle: './src/index.js',
    fib: './src/work/fib.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.json', '.node']
  },
  output: {
    path: path.resolve(__dirname, 'public/js')
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
