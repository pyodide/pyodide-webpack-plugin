import fs from "fs";
import os from "os";
import path from "path";
import assert from "assert";
import webpack from "webpack";

import options from "./configs/webpack.defaults.js";

describe("pyodide webpack plugin", () => {
  let tmpDir;
  beforeEach(async () => {
    tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pyodide-webpack-plugin"));
  });
  afterEach(async () => {
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
  });

  it("Compiles routes nested at one level", (done) => {
    webpack(options(tmpDir), function (err, stats) {
      try {
        assert.ok(!err, err);
        assert.ok(stats, "no stats");
        assert.ok(!stats.hasErrors(), stats.toString());

        const files = stats.toJson().assets?.map((x) => x.name);
        assert.ok(files, "no files");

        assert.ok(files.indexOf("pyodide/pyodide.asm.wasm") !== -1);
        assert.ok(files.indexOf("pyodide/pyodide.asm.js") !== -1);
        assert.ok(files.indexOf("pyodide/python_stdlib.zip") !== -1);
        assert.ok(files.indexOf("pyodide/pyodide-lock.json") !== -1);
        assert.ok(files.indexOf("pyodide/package.json") !== -1);

        done();
      } catch (e) {
        done(e.message);
      }
    });
  });
});
