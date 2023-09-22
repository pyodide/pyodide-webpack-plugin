import { ObjectPattern, Transform } from "copy-webpack-plugin";

interface PyodideObjectPattern extends ObjectPattern {
  to: string;
}

type FileFunction = (pkg: Pkg) => string[];

interface Pkg {
  files?: string[];
}

const files: { [key: string]: string[] | FileFunction } = {
  "0.21.3": [
    "distutils.tar",
    "package.json",
    "pyodide_py.tar",
    "pyodide.asm.js",
    "pyodide.asm.js",
    "pyodide.asm.data",
    "pyodide.asm.wasm",
    "repodata.json",
  ],
  "0.22.1": [
    "package.json",
    "pyodide_py.tar",
    "pyodide.asm.js",
    "pyodide.asm.data",
    "pyodide.asm.wasm",
    "repodata.json",
  ],
  "0.23.0": ["package.json", "pyodide.asm.js", "pyodide.asm.wasm", "repodata.json", "python_stdlib.zip"],
  "0.24.0": function (pkg: Pkg) {
    if (!pkg.files) {
      return [];
    }
    // list of files to ignore
    const ignore = [/^pyodide.m?js.*/, /.+\.d\.ts$/, /.+\.html$/];
    // files to ensure are always included
    const always = ["package.json"];
    const filtered = pkg.files.filter((file) => {
      return !ignore.some((v) => file.match(v));
    });
    always.forEach((f) => {
      if (!filtered.includes(f)) {
        filtered.push(f);
      }
    });
    return filtered;
  },
};
export const versions = Object.keys(files);

/**
 * Choose the set of files to match for copying out of pyodide.
 * Based on the version passed. If no version is available in files to match
 * that is great enough an empty array is returned.
 * @param version
 * @returns {string[]}
 */
export function choose(version = "0.0.0"): string[] | FileFunction {
  let chosen: string[] | FileFunction = [];
  for (let i = 0; i < versions.length; i++) {
    if (version >= versions[i]) {
      chosen = files[versions[i]];
    }
  }
  return chosen;
}
/**
 * Choose the set of files to match for copying out of pyodide.
 * Based on the version passed. If no version is available in files to match
 * that is great enough an empty array is returned.
 * @param version
 * @param pattern
 * @param packageIndexUrl
 * @returns {PyodideObjectPattern[]}
 */
export function transform(version: string, pattern: string[], packageIndexUrl): PyodideObjectPattern[] {
  return pattern.map((name) => {
    let transform: Transform | undefined;
    if (packageIndexUrl && name == "pyodide.asm.js") {
      transform = {
        transformer: (input) => {
          return input
            .toString()
            .replace("resolvePath(file_name,API.config.indexURL)", `resolvePath(file_name,"${packageIndexUrl}")`);
        },
      };
    }
    return { from: name, to: name, transform };
  });
}

export function chooseAndTransform(pkg, packageIndexUrl?: string) {
  packageIndexUrl = packageIndexUrl ?? `https://cdn.jsdelivr.net/pyodide/v${pkg.version}/full/`;
  let files = choose(pkg.version);
  if (typeof files === "function") {
    files = files(pkg);
  }
  return transform(pkg.version, files, packageIndexUrl);
}
