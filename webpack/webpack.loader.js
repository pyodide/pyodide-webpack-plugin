import path from "path";
import _ from "lodash";
import fs from "fs";
import nodeExternals from "webpack-node-externals";
import { fileURLToPath } from "url";
import { AfterBuild } from "./after-build.js";
import pkg from "../package.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// webpack config overloads when type is es6
// npx webpack --env output='es6'

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
      filename: "loader.cjs",
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
      new AfterBuild((compiler) => {
        delete pkg.scripts;
        delete pkg.devDependencies;
        delete pkg.overrides;
        delete pkg.type;
        delete pkg.prettier;
        fs.writeFileSync(path.resolve(compiler.outputPath, "package.json"), JSON.stringify(pkg, undefined, 2));
        fs.writeFileSync(
          path.resolve(
            __dirname,
            "..",
            "examples",
            "commonjs",
            "node_modules",
            "@pyodide",
            "webpack-plugin",
            "loader.cjs"
          ),
          fs.readFileSync(path.join(compiler.outputPath, "loader.cjs"))
        );
        fs.writeFileSync(
          path.resolve(__dirname, "..", "examples", "esm", "node_modules", "@pyodide", "webpack-plugin", "loader.cjs"),
          fs.readFileSync(path.join(compiler.outputPath, "loader.cjs"))
        );
      }),
      // new ExtraWatchWebpackPlugin({
      //   files: ["loader.cjs"],
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
