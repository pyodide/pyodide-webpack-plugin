import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { PyodidePlugin } from "@pyodide/webpack-plugin";

export default (_, argv) =>
  /** @type {import("webpack").Configuration} */ ({
    target: "web",
    mode: argv.mode || "development",
    entry: path.resolve("index.js"),
    experiments: {
      outputModule: true,
    },
    bail: false,
    output: {
      path: path.resolve("dist"),
      filename: "example.js",
      chunkFormat: "module",
      library: {
        type: "module",
      },
    },
    externalsPresets: {node: true},
    devServer: {
      static: {
        directory: path.resolve("dist"),
      },
      compress: true,
      port: 9000,
    },
    plugins: [new PyodidePlugin(), new HtmlWebpackPlugin({
      scriptLoading: "module"
    })],
  });
