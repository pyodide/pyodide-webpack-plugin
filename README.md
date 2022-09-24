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
const PyodidePlugin = require("@pyodide/webpack-plugin");

module.exports = {
  plugins: [new PyodidePlugin()],
};
```

## Options

- [autoCdnIndexUrl](#autoCdnIndexUrl)
- [globalLoadPyodide](#globalLoadPyodide)

### autoCdnIndexUrl

Type: `boolean`\
Default: `true`\
_Description_: Automatically use the pyodide CDN endpoint for micropip packages. Setting this value to false means you must download micropip and related packages yourself and serve them. This option differs from [loadPyodide indexUrl](https://pyodide.org/en/stable/usage/api/js-api.html) in that it only impacts micropip and pip packages and _does not_ affect the location the main pyodide runtime location.

### globalLoadPyodide

Type: `boolean`\
Default: `false`\
_Description_:Whether or not to expose loadPyodide method globally. A globalThis.loadPyodide is useful when using pyodide as a standalone script or in certain frameworks. With webpack we can scope the pyodide package locally to prevent leaks (default).

## Contributing

Please view the [contributing guide](./CONTRIBUTING.md) for tips on filing issues, making changes, and submitting pull requests. Pyodide is an independent and community-driven open-source project. The decision-making process is outlined in the [Project governance](https://pyodide.org/en/stable/project/governance.html).

https://github.com/pyodide/pyodide/blob/main/CODE-OF-CONDUCT.md

## License

Pyodide Webpack Plugin uses the [Mozilla Public License Version 2.0](https://choosealicense.com/licenses/mpl-2.0/).
