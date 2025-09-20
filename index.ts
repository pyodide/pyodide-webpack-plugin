import fs from "fs";
import url from "url";
import assert from "assert";
import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";
import * as patterns from "./lib/patterns";
import { createRequire } from "node:module";

function noop(_) {
  return _;
}

let dirname;
try {
  // @ts-ignore import.meta is only available in esm...
  dirname = path.dirname(url.fileURLToPath(import.meta.url));
} catch (e) {
  noop(e);
}

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

    options.patterns = patterns.chooseAndTransform(pkg, options.packageIndexUrl).map((pattern) => {
      return {
        from: path.resolve(pyodidePackagePath, pattern.from),
        to: path.join(outDirectory, pattern.to),
        transform: pattern.transform,
      };
    });
    assert.ok(options.patterns.length > 0, `Unsupported version of pyodide. Must use >=${patterns.versions[0]}`);
    // we have to delete all pyodide plugin options before calling super. Rest of options passed to copy webpack plugin
    delete options.packageIndexUrl;
    delete options.globalLoadPyodide;
    delete options.outDirectory;
    delete options.version;
    delete options.pyodideDependencyPath;
    super(options as Required<PyodideOptions>);
    this.globalLoadPyodide = globalLoadPyodide;
  }
  apply(compiler: webpack.Compiler) {
    super.apply(compiler);
    compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
      const compilationHooks = webpack.NormalModule.getCompilationHooks(compilation);
      compilationHooks.beforeLoaders.tap(this.constructor.name, (loaders, normalModule) => {
        const matches = normalModule.userRequest.match(/pyodide\.m?js$/);
        if (matches) {
          // add a new loader specifically to handle pyodide.m?js. See loader.ts for functionalidy
          loaders.push({
            loader: path.resolve(dirname, "loader.cjs"),
            options: {
              globalLoadPyodide: this.globalLoadPyodide,
              isModule: matches[0].endsWith(".mjs"),
            },
            ident: "pyodide",
            type: null,
          });
        }
      });
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
function tryGetPyodidePath(pyodidePath?: string): string {
  if (pyodidePath) {
    return path.resolve(pyodidePath);
  }

  let pyodideEntrypoint = "";
  if (typeof require) {
    try {
      pyodideEntrypoint = __non_webpack_require__.resolve("pyodide");
    } catch (e) {
      noop(e);
    }
  } else {
    try {
      // @ts-ignore import.meta is only available in esm...
      const r = createRequire(import.meta.url);
      pyodideEntrypoint = r.resolve("pyodide");
    } catch (e) {
      noop(e);
    }
  }
  const walk = (p: string): string => {
    const stat = fs.statSync(p);
    if (stat.isFile()) {
      return walk(path.dirname(p));
    }
    if (stat.isDirectory()) {
      if (path.basename(p) === "node_modules") {
        throw new Error(
          "unable to locate pyodide package. You can define it manually with pyodidePath if you're trying to test something novel",
        );
      }
      for (const dirent of fs.readdirSync(p, { withFileTypes: true })) {
        if (dirent.name !== "package.json" || dirent.isDirectory()) {
          continue;
        }
        try {
          const pkg = fs.readFileSync(path.join(p, dirent.name), "utf-8");
          const pkgJson = JSON.parse(pkg);
          if (pkgJson.name === "pyodide") {
            // found pyodide package root. Exit this thing
            return p;
          }
        } catch (e) {
          throw new Error(
            `unable to locate and parse pyodide package.json. You can define it manually with pyodidePath if you're trying to test something novel. ${(e as Error).message}`,
          );
        }
      }
      return walk(path.dirname(p));
    }
    throw new Error(
      "unable to locate pyodide package. You can define it manually with pyodidePath if you're trying to test something novel",
    );
  };
  return walk(pyodideEntrypoint);
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
    throw new Error(`unable to read package.json from pyodide dependency in ${pkgPath}. ${(e as Error).message}`);
  }
}

export default PyodidePlugin;
