import path from "path";
import _ from "lodash";
import fs from "fs";
import nodeExternals from "webpack-node-externals";
import { fileURLToPath } from "url";
import { AfterBuild } from "./after-build.js";
import { moveToExample } from "./examples.js";
// import pkg from "../package.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// webpack config overloads when type is es6
// npx webpack --env output='es6'

export const loader = async (env, argv) => {
  const pkg = JSON.parse(await fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf-8"));
  return /** @type {import("webpack").Configuration} */ {
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
        // copy the build plugin into the examples folder. This has to happen
        // because otherwise webpack will fail on the type of Configuration object not matching in memory
        // this is a static type check in the runtime that causing the issue.
        delete pkg.scripts;
        delete pkg.devDependencies;
        delete pkg.overrides;
        delete pkg.type;
        delete pkg.prettier;
        delete pkg.workspaces;
        fs.writeFileSync(path.resolve(compiler.outputPath, "package.json"), JSON.stringify(pkg, undefined, 2));
        moveToExample(compiler.outputPath, "loader.cjs");
        moveToExample(compiler.outputPath, "package.json");
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
  };
};
