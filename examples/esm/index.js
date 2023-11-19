import { loadPyodide, version } from "pyodide";

export async function main() {
  console.log("pyodide version", version);
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
