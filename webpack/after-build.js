export class AfterBuild {
  constructor(callback) {
    if (typeof callback !== "function") {
      throw new Error("After Build Plugin requires a callback function");
    }
    this.callback = callback;
  }
  apply(compiler) {
    if (process.env.WEBPACK_WATCH) {
      return compiler.hooks.watchClose.tap("AfterBuild", (stats) => {
        this.callback(compiler, stats);
      });
    }
    return compiler.hooks.done.tap("AfterBuild", (stats) => {
      this.callback(compiler, stats);
    });
  }
}
