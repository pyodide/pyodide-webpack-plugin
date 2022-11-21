const path = require("path");
const _ = require("lodash");
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

// webpack config overloads when type is es6
// npx webpack --env output='es6'

const es6 = {
  experiments: {
    outputModule: true,
  },
  output: {
    filename: "plugin.mjs",
    chunkFormat: "module",
    library: {
      type: "module",
    },
  },
  externals: [nodeExternals({ importType: "module" })],
  module: {
    rules: [
      {
        use: [
          {
            options: {
              configFile: "configs/tsconfig.esm.json",
            },
          },
        ],
      },
    ],
  },
};
// webpack config overloads when type is undefined
// npm run build
const umd = {
  output: {
    library: {
      name: "PyodidePlugin",
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "package.json" }, { from: "README.md" }],
    }),
  ],
  module: {
    rules: [
      {
        use: [
          {
            options: {
              configFile: "configs/tsconfig.umd.json",
            },
          },
        ],
      },
    ],
  },
};

// webpack config
module.exports = (env) => {
  const config = _.merge(
    {
      target: "node",
      mode: env.mode || "development",
      entry: "./index.ts",
      optimization: {
        minimize: false,
      },
      ...(env.mode === "production" ? {} : { devtool: "inline-source-map" }),
      output: {
        path: path.join(__dirname, "dist"),
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
      plugins: [],
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
                options: {},
              },
            ],
            exclude: /node_modules/,
          },
        ],
      },
    },
    env.output === "es6" ? es6 : umd
  );
  return config;
};
