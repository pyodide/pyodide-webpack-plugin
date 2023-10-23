[![Node.js CI](https://github.com/pyodide/pyodide-webpack-plugin/actions/workflows/build-and-test.yml/badge.svg?branch=main)](https://github.com/pyodide/pyodide-webpack-plugin/actions/workflows/build-and-test.yml)

# Pyodide Webpack Plugin

A Webpack plugin for integrating pyodide into your project.

> works with pyodide >=0.21.3

## Getting Started

Install pyodide and @pyodide/webpack-plugin

```
npm install --save-dev pyodide @pyodide/webpack-plugin
```

or

```
yarn add -D pyodide @pyodide/webpack-plugin
```

or

```
pnpm add -D pyodide @pyodide/webpack-plugin
```

Add the plugin to your webpack config

```js
const { PyodidePlugin } = require("@pyodide/webpack-plugin");

module.exports = {
  plugins: [new PyodidePlugin()],
};
```

In your javascript application being bundled with webpack

```js
async function main() {
  let pyodide = await loadPyodide({ indexURL: `${window.location.origin}/pyodide` });
  // Pyodide is now ready to use...
  console.log(
    pyodide.runPython(`
    import sys
    sys.version
  `)
  );
}
main();
```

See [examples](./examples/) for more information.

## Options

- [globalLoadPyodide](#globalLoadPyodide)
- [outDirectory](#outDirectory)
- [packageIndexUrl](#packageIndexUrl)

### globalLoadPyodide

Type: `boolean`\
Default: `false`\
Required: false\
_Description_:Whether or not to expose loadPyodide method globally. A globalThis.loadPyodide is useful when using pyodide as a standalone script or in certain frameworks. With webpack we can scope the pyodide package locally to prevent leaks (default).

### outDirectory

Type: `string`\
Default: `pyodide`\
Required: false\
_Description_: Relative path to webpack root where you want to output the pyodide files.

### packageIndexUrl

Type: `string`\
Default: `https://cdn.jsdelivr.net/pyodide/v${installedPyodideVersion}/full/`\
Required: false\
_Description_: CDN endpoint for python packages. This option differs from [loadPyodide indexUrl](https://pyodide.org/en/stable/usage/api/js-api.html) in that it only impacts pip packages and _does not_ affect the location the main pyodide runtime location. Set this value to "" if you want to keep the pyodide default of accepting the indexUrl.

## Known issues with esm

> ESM builds are currently failing if you use the pyodide esm module. You can fix this by importing the commonjs build into your project `import { loadPyodide } from "pyodide/pyodide.js";`

Depending on your webpack configuration you may run into issues with webpack trying to parse your pyodide.mjs file.

**Can't resolve 'url' in ...**

[Issue #8](https://github.com/pyodide/pyodide-webpack-plugin/issues/8) deals with this error and pyodide esm. To fix this issue:

- `npm i -D url`
- Add a [fall back](https://webpack.js.org/configuration/resolve/#resolvefallback) to your webpack config
  ```js
  resolve: {
    fallback: {
      url: require.resolve("url/"),
    },
  },
  ```

**Cannot find module '<...>/pyodide.asm.js.**

This can happen when webpack munges esm import statements to \_\_webpack_require\_\_ when you actually intend import to work in the browser.

- `npm i -D string-replace-loader`
- Add a [rule](https://webpack.js.org/configuration/module/#rule) to your webpack config
  ```js
  {
    test: /pyodide\.m?js$/,
    use: [
      {
        loader: 'string-replace-loader',
        options: {
          search: 'import(',
          replace: 'import(/* webpackIgnore: true */ '
        }
      }
    ]
  }
  ```

## Contributing

Please view the [contributing guide](./CONTRIBUTING.md) for tips on filing issues, making changes, and submitting pull requests. Pyodide is an independent and community-driven open-source project. The decision-making process is outlined in the [Project governance](https://pyodide.org/en/stable/project/governance.html).

https://github.com/pyodide/pyodide/blob/main/CODE-OF-CONDUCT.md

## License

Pyodide Webpack Plugin uses the [Mozilla Public License Version 2.0](https://choosealicense.com/licenses/mpl-2.0/).
