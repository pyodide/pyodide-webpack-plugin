const path = require("path");
const nodeExternals = require("webpack-node-externals");

const { PyodidePlugin } = require(path.resolve(__dirname, "..", "..", "dist", "plugin.js"));

const config = {
  target: "node",
  mode: "development",
  entry: path.resolve(__dirname, "..", "fixtures", "index.js"),
  optimization: {
    minimize: false,
  },
  output: {
    path: path.resolve(__dirname, "..", "dist"),
    filename: "plugin.js",
    library: {
      type: "umd",
    },
    umdNamedDefine: true,
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
  },
  performance: {
    hints: false,
  },
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  resolve: {
    extensions: [".js"],
  },
};

module.exports = {
  config,
  PyodidePlugin,
};
