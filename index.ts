import fs from "fs";
import assert from "assert";
import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import { Compiler } from "webpack";
import * as patterns from "./lib/patterns";

interface PyodideOptions extends Partial<CopyPlugin.PluginOptions> {
  /**
   * CDN endpoint for python packages
   * This option differs from
   * [loadPyodide indexUrl](https://pyodide.org/en/stable/usage/api/js-api.html)
   * in that it only impacts pip packages and _does not_ affect
   * the location the main pyodide runtime location. Set this value to "" if you want to keep
   * the pyodide default of accepting the indexUrl.
   *
   * @default https://cdn.jsdelivr.net/pyodide/v${installedPyodideVersion}/full/
   */
  packageIndexUrl?: string;
  /**
   * Whether or not to expose loadPyodide method globally. A globalThis.loadPyodide is useful when
   * using pyodide as a standalone script or in certain frameworks. With webpack we can scope the
   * pyodide package locally to prevent leaks (default).
   *
   * @default false
   */
  globalLoadPyodide?: boolean;
  /**
   * Relative path to webpack root where you want to output the pyodide files.
   * Defaults to pyodide
   */
  outDirectory?: string;
  /**
   * Pyodide package version to use when resolving the default pyodide package index url. Default
   * version is whatever version is installed in {pyodideDependencyPath}
   */
  version?: string;
  /**
   * Path on disk to the pyodide module. By default the plugin will attempt to look
   * in ./node_modules for pyodide.
   */
  pyodideDependencyPath?: string;
}

interface IPrivateSource {
  _source: {
    _value: string;
    source: () => string;
  };
}

export class PyodidePlugin extends CopyPlugin {
  readonly globalLoadPyodide: boolean;

  constructor(options: PyodideOptions = {}) {
    let outDirectory = options.outDirectory || "pyodide";
    if (outDirectory.startsWith("/")) {
      outDirectory = outDirectory.slice(1);
    }
    const globalLoadPyodide = options.globalLoadPyodide || false;
    const pyodidePackagePath = tryGetPyodidePath(options.pyodideDependencyPath);
    const pkg = tryResolvePyodidePackage(pyodidePackagePath, options.version);

    options.patterns = patterns.chooseAndTransform(pkg.version, options.packageIndexUrl).map((pattern) => {
      return {
        from: path.resolve(pyodidePackagePath, pattern.from),
        to: path.join(outDirectory, pattern.to),
        transform: pattern.transform,
      };
    });
    assert.ok(options.patterns.length > 0, `Unsupported version of pyodide. Must use >=${patterns.versions[0]}`);
    delete options.packageIndexUrl;
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
/**
 * Try to find the pyodide path. Can't use require.resolve because it is not supported in
 * module builds. Nodes import.meta.resolve is experimental and still very new as of node 19.x
 * This method is works universally under the assumption of an install in node_modules/pyodide
 * @param pyodidePath
 * @returns
 */
function tryGetPyodidePath(pyodidePath?: string) {
  if (pyodidePath) {
    return path.resolve(pyodidePath);
  }
  const modulePath = path.resolve("node_modules");
  for (const dependencyPath of fs.readdirSync(path.resolve("node_modules"), { withFileTypes: true })) {
    if (dependencyPath.name === "pyodide" && dependencyPath.isDirectory()) {
      return path.join(modulePath, dependencyPath.name);
    }
  }
  throw new Error(`Unable to resolve pyodide package path in ${modulePath}`);
}

/**
 * Read the pyodide package dependency package.json to return necessary metadata
 * @param version
 * @returns
 */
function tryResolvePyodidePackage(pyodidePath: string, version?: string) {
  if (version) {
    return { version };
  }
  const pkgPath = path.resolve(pyodidePath, "package.json");
  try {
    const pkg = fs.readFileSync(pkgPath, "utf-8");
    return JSON.parse(pkg);
  } catch (e) {
    throw new Error(`unable to read package.json from pyodide dependency in ${pkgPath}`);
  }
}

export default PyodidePlugin;
