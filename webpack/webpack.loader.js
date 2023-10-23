import path from "path";
import _ from "lodash";
import fs from "fs";
import nodeExternals from "webpack-node-externals";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// webpack config overloads when type is es6
// npx webpack --env output='es6'

class AfterBuild {
  constructor(callback) {
    if (typeof callback !== "function") {
      throw new Error("After Build Plugin requires a callback function");
    }
    this.callback = callback;
  }
  apply(compiler) {
    if (process.env.WEBPACK_WATCH) {
      return compiler.hooks.watchClose.tap("AfterBuild", (stats) => {
        this.callback(compiler, stats);
      });
    }
    return compiler.hooks.done.tap("AfterBuild", (stats) => {
      this.callback(compiler, stats);
    });
  }
}

export const loader = (env, argv) =>
  /** @type {import("webpack").Configuration} */ ({
    target: "node",
    mode: argv.mode || "development",
    entry: "./loader.ts",
    optimization: {
      minimize: false,
    },
    ...(argv.mode === "production" ? {} : { devtool: "inline-source-map" }),
    output: {
      path: path.join(__dirname, "..", "dist"),
      filename: "loader.js",
      library: {
        name: "pyodide-webpack-loader",
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
      // TODO: DELETE THIS. It's for testing that the examples work.
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
          path.resolve(
            __dirname,
            "..",
            "examples",
            "commonjs",
            "node_modules",
            "@pyodide",
            "webpack-plugin",
            "plugin.mjs"
          ),
          fs.readFileSync(path.join(compiler.outputPath, "plugin.mjs"))
        );
        fs.writeFileSync(
          path.resolve(
            __dirname,
            "..",
            "examples",
            "commonjs",
            "node_modules",
            "@pyodide",
            "webpack-plugin",
            "loader.js"
          ),
          fs.readFileSync(path.join(compiler.outputPath, "loader.js"))
        );

        fs.writeFileSync(
          path.resolve(__dirname, "..", "examples", "esm", "node_modules", "@pyodide", "webpack-plugin", "plugin.js"),
          fs.readFileSync(path.join(compiler.outputPath, "plugin.js"))
        );
        fs.writeFileSync(
          path.resolve(__dirname, "..", "examples", "esm", "node_modules", "@pyodide", "webpack-plugin", "plugin.mjs"),
          fs.readFileSync(path.join(compiler.outputPath, "plugin.mjs"))
        );
        fs.writeFileSync(
          path.resolve(__dirname, "..", "examples", "esm", "node_modules", "@pyodide", "webpack-plugin", "loader.js"),
          fs.readFileSync(path.join(compiler.outputPath, "loader.js"))
        );
      }),
      // new ExtraWatchWebpackPlugin({
      //   files: ["loader.js"],
      // }),
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
      ],
    },
  });
