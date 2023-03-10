const assert = require("assert");
const webpack = require("webpack");

const options = require("./configs/webpack.defaults");

describe("pyodide webpack plugin", () => {
  it("Compiles routes nested at one level", (done) => {
    webpack(options, function (err, stats) {
      try {
        assert.ok(!err, err);
        assert.ok(stats, "no stats");
        assert.ok(!stats.hasErrors(), stats.toString());

        const files = stats.toJson().assets?.map((x) => x.name);
        assert.ok(files, "no files");

        assert.ok(files.indexOf("pyodide/pyodide.asm.wasm") !== -1);
        assert.ok(files.indexOf("pyodide/pyodide.asm.data") !== -1);
        assert.ok(files.indexOf("pyodide/pyodide.asm.js") !== -1);

        assert.ok(files.indexOf("pyodide/pyodide_py.tar") !== -1);
        assert.ok(files.indexOf("pyodide/repodata.json") !== -1);
        assert.ok(files.indexOf("pyodide/package.json") !== -1);

        done();
      } catch (e) {
        done(e.message);
      }
    });
  });
});
