const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  target: "node",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".json", ".node"]
  },
  output: {
    library: "MyLibrary",
    libraryTarget: "umd",
    libraryExport: "default",
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
