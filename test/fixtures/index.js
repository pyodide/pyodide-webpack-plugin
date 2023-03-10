const loadPyodide = require("pyodide");

async function main() {
  // eslint-disable-next-line
  let pyodide = await loadPyodide({ indexURL: `${window.location.origin}/pyodide` });
  // Pyodide is now ready to use...
  console.log(
    pyodide.runPython(`
    import sys
    sys.version
  `)
  );
  console.log("hello world");
}
main();
