const path = require("path");
const _ = require("lodash");
const CopyPlugin = require("copy-webpack-plugin");

// webpack config overloads when type is es6
// npx webpack --env output='es6'
const es6 = {
  experiments: {
    outputModule: true,
  },
  output: {
    filename: "plugin.mjs",
    library: {
      type: "module",
    },
  },
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
      patterns: [{ from: "package.json" }],
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
module.exports = (env, argv) => {
  const config = _.merge(
    {
      node: { global: true },
      mode: env.mode || "production",
      entry: "./index.ts",
      optimization: {
        minimize: false,
      },
      ...(env.mode === "production" ? {} : { devtool: "inline-source-map" }),
      output: {
        path: path.join(__dirname, "dist"),
        filename: "plugin.js",
        library: {
          // commonjs: "pyodide-plugin",
          // amd: "pyodide-plugin",
          // root: "PyodidePlugin",
          type: "umd",
        },
        umdNamedDefine: true,
        globalObject: `(typeof self !== 'undefined' ? self : this)`,
      },
      performance: {
        hints: false,
      },
      plugins: [],
      resolve: {
        extensions: [".ts", ".js"],
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
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
  console.log(env, config);
  return config;
};
