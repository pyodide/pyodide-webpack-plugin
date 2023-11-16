import { loadPyodide } from "pyodide";

export async function main() {
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
