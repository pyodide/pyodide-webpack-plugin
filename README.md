[![Node.js CI](https://github.com/pyodide/pyodide-webpack-plugin/actions/workflows/build-and-test.yml/badge.svg?branch=main)](https://github.com/pyodide/pyodide-webpack-plugin/actions/workflows/build-and-test.yml)

# Pyodide Webpack Plugin

A Webpack plugin for integrating pyodide into your project.

> works with pyodide >=0.21.3

For versions of Pyodide older than 0.28.0 please use @pyodide/pyodide-webpack-plugin@1.3.3 or older.

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
  `),
  );
}
main();
```

See [examples](./examples/).

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

## Contributing

Please view the [contributing guide](./CONTRIBUTING.md) for tips on filing issues, making changes, and submitting pull requests. Pyodide is an independent and community-driven open-source project. The decision-making process is outlined in the [Project governance](https://pyodide.org/en/stable/project/governance.html).

https://github.com/pyodide/pyodide/blob/main/CODE-OF-CONDUCT.md

## License

Pyodide Webpack Plugin uses the [Mozilla Public License Version 2.0](https://choosealicense.com/licenses/mpl-2.0/).
