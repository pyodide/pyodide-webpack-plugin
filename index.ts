import path from "path";
import CopyPlugin from "copy-webpack-plugin";

interface PyodideOptions extends CopyPlugin.PluginOptions {}

export class PyodidePlugin extends CopyPlugin {
  static pyodidePackage: string = path.dirname(__non_webpack_require__.resolve("pyodide"));

  constructor(options: PyodideOptions) {
    const outRoot = "pyodide";
    console.log("pyodide path", PyodidePlugin.pyodidePackage);
    const pkg = require(path.resolve(PyodidePlugin.pyodidePackage, "package.json"));
    options.patterns = [
      {
        from: path.resolve(PyodidePlugin.pyodidePackage, "distutils.tar"),
        to: path.join(outRoot, "distutils.tar"),
      },
      { from: path.resolve(PyodidePlugin.pyodidePackage, "packages.json"), to: path.join(outRoot, "packages.json") },
      { from: path.resolve(PyodidePlugin.pyodidePackage, "pyodide_py.tar"), to: path.join(outRoot, "pyodide_py.tar") },
      {
        from: path.resolve(PyodidePlugin.pyodidePackage, "pyodide.asm.js"),
        to: path.join(outRoot, "pyodide.asm.js"),
        transform: {
          transformer: (input) => {
            return input
              .toString()
              .replace("new URL(indexURL", `new URL('https://cdn.jsdelivr.net/pyodide/v${pkg.version}/full/'`);
          },
        },
      },
      {
        from: path.resolve(PyodidePlugin.pyodidePackage, "pyodide.asm.data"),
        to: path.join(outRoot, "pyodide.asm.data"),
      },
      {
        from: path.resolve(PyodidePlugin.pyodidePackage, "pyodide.asm.wasm"),
        to: path.join(outRoot, "pyodide.asm.wasm"),
      },
    ];
    super(options);
  }
}

export default PyodidePlugin;
