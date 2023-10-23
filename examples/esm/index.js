import { loadPyodide } from "pyodide/pyodide.js";

export async function main() {
  console.log(loadPyodide);
  let pyodide = await loadPyodide({
    indexURL: `${window.location.origin}/pyodide`,
  });
  // Pyodide is now ready to use...
  console.log(
    pyodide.runPython(`
    import sys
    sys.version
  `)
  );
}
main();
