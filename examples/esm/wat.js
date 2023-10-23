__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   main: () => (/* binding */ main)
/* harmony export */ });
/* harmony import */ var pyodide__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pyodide */ "./node_modules/pyodide/pyodide.mjs");


async function main() {
  console.log(pyodide__WEBPACK_IMPORTED_MODULE_0__.loadPyodide);
  let pyodide = await (0,pyodide__WEBPACK_IMPORTED_MODULE_0__.loadPyodide)({
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


//# sourceURL=webpack://pyodide-webpack-plugin-commonjs/./index.js?
