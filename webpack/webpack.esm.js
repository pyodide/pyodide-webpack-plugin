import path from "path";
import _ from "lodash";
import nodeExternals from "webpack-node-externals";
import webpack from "webpack";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// webpack config overloads when type is es6
// npx webpack --env output='es6'

export const esm = (env, argv) =>
  /** @type {import("webpack").Configuration} */ ({
    target: "node",
    mode: argv.mode || "development",
    entry: "./index.ts",
    experiments: {
      outputModule: true,
    },
    optimization: {
      minimize: false,
    },
    ...(argv.mode === "production" ? {} : { devtool: "inline-source-map" }),
    output: {
      path: path.join(__dirname, "..", "dist"),
      filename: "plugin.mjs",
      chunkFormat: "module",
      library: {
        type: "module",
      },
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },
    performance: {
      hints: false,
    },
    externalsPresets: { node: true },
    externals: [nodeExternals({ importType: "module" })],
    plugins: [
      new webpack.DefinePlugin({
        MODULE: JSON.stringify(true),
      }),
    ],
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      parser: {
        javascript: {
          importMeta: false,
        },
      },
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: {
                  lib: ["ES2022", "DOM"],
                  target: "ES2022",
                  module: "ES2022",
                  moduleResolution: "NodeNext",
                  declarationDir: "./dist/types/esm",
                },
              },
            },
          ],
          exclude: /node_modules/,
        },
      ],
    },
  });
