import assert from "assert";
import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import { Compiler } from "webpack";
import * as patterns from "./lib/patterns";

interface PyodideOptions extends Partial<CopyPlugin.PluginOptions> {
  /**
   * CDN endpoint for micropip packages
   * This option differs from
   * [loadPyodide indexUrl](https://pyodide.org/en/stable/usage/api/js-api.html)
   * in that it only impacts micropip and pip packages and _does not_ affect
   * the location the main pyodide runtime location. Set this value to "" if you want to keep
   * the pyodide default of accepting the indexUrl.
   *
   * @default https://cdn.jsdelivr.net/pyodide/v${installedPyodideVersion}/full/
   */
  micropipCdnUrl?: string;
  /**
   * Whether or not to expose loadPyodide method globally. A globalThis.loadPyodide is useful when
   * using pyodide as a standalone script or in certain frameworks. With webpack we can scope the
   * pyodide package locally to prevent leaks (default).
   *
   * @default false
   */
  globalLoadPyodide?: boolean;
}

interface IPrivateSource {
  _source: {
    _value: string;
    source: () => string;
  };
}

export class PyodidePlugin extends CopyPlugin {
  static pyodidePackagePath: string = path.dirname(__non_webpack_require__.resolve("pyodide"));

  readonly globalLoadPyodide: boolean;

  constructor(options: PyodideOptions = {}) {
    const outRoot = "pyodide";
    const globalLoadPyodide = options.globalLoadPyodide || false;
    const pkg = __non_webpack_require__(path.resolve(PyodidePlugin.pyodidePackagePath, "package.json"));
    options.patterns = patterns.chooseAndTransform(pkg.version, options.micropipCdnUrl).map((pattern) => {
      return {
        from: path.resolve(PyodidePlugin.pyodidePackagePath, pattern.from),
        to: path.join(outRoot, pattern.to),
        transform: pattern.transform,
      };
    });
    assert.ok(options.patterns.length > 0, `Unsupported version of pyodide. Must use >=${patterns.versions[0]}`);
    delete options.micropipCdnUrl;
    delete options.globalLoadPyodide;
    super(options as Required<PyodideOptions>);
    this.globalLoadPyodide = globalLoadPyodide;
  }
  apply(compiler: Compiler) {
    super.apply(compiler);
    if (this.globalLoadPyodide) {
      return;
    }
    // strip global loadPyodide
    compiler.hooks.make.tap(this.constructor.name, (compilation) => {
      compilation.hooks.succeedModule.tap(
        {
          name: "pyodide-webpack-plugin",
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY,
        },
        (module) => {
          const isPyodide = module.nameForCondition()?.match(/pyodide\/pyodide\.m?js$/);
          if (!isPyodide) {
            return;
          }
          const source = (module as unknown as IPrivateSource)._source;
          source._value = source.source().replace("globalThis.loadPyodide=loadPyodide", "({})");
        }
      );
    });
  }
}

export default PyodidePlugin;
