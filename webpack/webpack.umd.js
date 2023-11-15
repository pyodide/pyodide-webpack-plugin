import path from "path";
import url from "url";
import _ from "lodash";
import nodeExternals from "webpack-node-externals";
import { AfterBuild } from "./after-build.js";
import { moveToExample } from "./examples.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * webpack config overloads when type is undefined npm run build
 */
export const umd = (_, argv) =>
  /**@type {import("webpack").Configuration}*/ ({
    target: "node",
    mode: argv.mode || "development",
    entry: "./index.ts",
    optimization: {
      minimize: false,
    },
    ...(argv.mode === "production" ? {} : { devtool: "inline-source-map" }),
    output: {
      path: path.join(__dirname, "..", "dist"),
      filename: "plugin.js",
      library: {
        name: "PyodidePlugin",
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
    plugins: [
      new AfterBuild((compiler) => {
        // copy the build plugin into the examples folder. This has to happen
        // because otherwise webpack will fail on the type of Configuration object not matching in memory
        // this is a static type check in the runtime that causing the issue.
        moveToExample(compiler.outputPath, "plugin.js");
      }),
    ],
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: "ts-loader",
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /index\.ts$/,
          loader: "string-replace-loader",
          options: {
            search: "path.dirname(url.fileURLToPath(import.meta.url))",
            replace: "__dirname",
          },
        },
      ],
    },
  });
