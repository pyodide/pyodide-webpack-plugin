const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { PyodidePlugin } = require("@pyodide/webpack-plugin");
const webpack = require("webpack");

module.exports = (_, argv) =>
  /** @type {import("webpack").Configuration} */ ({
    target: "web",
    mode: argv.mode || "development",
    devtool: false,
    entry: path.resolve(__dirname, "index.js"),
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "example.js",
    },
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      compress: true,
      port: 9000,
    },
    plugins: [new PyodidePlugin(), new HtmlWebpackPlugin()],
  });

module.exports.webpack = webpack;
