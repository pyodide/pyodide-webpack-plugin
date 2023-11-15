import path from "path";
import fs from "fs";
import url from "url";
import _ from "lodash";
import nodeExternals from "webpack-node-externals";
import { AfterBuild } from "./after-build.js";

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
        fs.writeFileSync(
          path.resolve(
            __dirname,
            "..",
            "examples",
            "commonjs",
            "node_modules",
            "@pyodide",
            "webpack-plugin",
            "plugin.js"
          ),
          fs.readFileSync(path.join(compiler.outputPath, "plugin.js"))
        );
        fs.writeFileSync(
          path.resolve(__dirname, "..", "examples", "esm", "node_modules", "@pyodide", "webpack-plugin", "plugin.js"),
          fs.readFileSync(path.join(compiler.outputPath, "plugin.js"))
        );
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
