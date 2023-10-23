const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { PyodidePlugin } = require("@pyodide/webpack-plugin");

module.exports = (_, argv) =>
  /** @type {import("webpack").Configuration} */ ({
    target: "web",
    mode: argv.mode || "development",
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
