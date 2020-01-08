const path = require("path");

module.exports = {
  entry: "./src/index.js",
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".json", ".node"]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public/js")
  }
};
