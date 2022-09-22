import { ObjectPattern, Transform } from "copy-webpack-plugin";

interface PyodideObjectPattern extends ObjectPattern {
  to: string;
}

const files = {
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
};
export const versions = Object.keys(files);

/**
 * Choose the set of files to match for copying out of pyodide.
 * Based on the version passed. If no version is available in files to match
 * that is great enough an empty array is returned.
 * @param version
 * @returns {string[]}
 */
export function choose(version = "0.0.0"): string[] {
  let chosen: string[] = [];
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
 * @param autoIndexUrl
 * @returns {PyodideObjectPattern[]}
 */
export function transform(version: string, pattern: string[], autoIndexUrl): PyodideObjectPattern[] {
  return pattern.map((name) => {
    let transform: Transform | undefined;
    if (autoIndexUrl && name == "pyodide.asm.js") {
      transform = {
        transformer: (input) => {
          return input
            .toString()
            .replace(
              "resolvePath(file_name,API.config.indexURL)",
              `resolvePath(file_name,'https://cdn.jsdelivr.net/pyodide/v${version}/full/')`
            );
        },
      };
    }
    return { from: name, to: name, transform };
  });
}

export function chooseAndTransform(version = "0.0.0", autoIndexUrl = true) {
  return transform(version, choose(version), autoIndexUrl);
}
