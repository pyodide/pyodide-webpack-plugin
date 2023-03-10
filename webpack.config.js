const path = require("path");
const _ = require("lodash");
const fs = require("fs");
const nodeExternals = require("webpack-node-externals");

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
    new AfterBuild(() => {
      const pkg = require("./package.json");
      delete pkg.scripts;
      delete pkg.devDependencies;
      delete pkg.overrides;
      delete pkg.prettier;
      fs.writeFileSync(path.resolve(__dirname, "dist", "package.json"), JSON.stringify(pkg, undefined, 2));
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
