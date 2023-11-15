import path from "path";
import url from "url";
import nodeExternals from "webpack-node-externals";
import { PyodidePlugin } from "../../dist/plugin.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const config = (outDir = undefined) => {
  return {
    target: "node",
    mode: "development",
    entry: path.resolve(__dirname, "..", "fixtures", "index.js"),
    optimization: {
      minimize: false,
    },
    output: {
      path: outDir || path.resolve(__dirname, "..", "dist"),
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
};

export default {
  config,
  PyodidePlugin,
};
