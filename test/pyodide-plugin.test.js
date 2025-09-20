import fs from "fs";
import os from "os";
import path from "path";
import url from "url";
import assert from "assert";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe("examples", () => {
  let tmpDir;
  const exampleDir = path.resolve(__dirname, "..", "examples");
  const examples = fs.readdirSync(exampleDir, { withFileTypes: true });
  // console.log(examples);
  beforeEach(async () => {
    tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pyodide-webpack-plugin"));
  });
  afterEach(async () => {
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
  });

  for (const example of examples) {
    if (!example.isDirectory()) {
      continue;
    }
    it(`should build ${example.name}`, async () => {
      // get the current directory
      const curDir = process.cwd();
      // wrap the whole test to ensure we can teardown safely
      const err = await new Promise(async (resolve) => {
        try {
          // change into example directory. This is why the test setup is so ugly
          process.chdir(path.join(exampleDir, example.name));
          // load our webpack config from the example directory
          const config = await import(path.join(exampleDir, example.name, "webpack.config.js"));
          // the config MUST export webpack itself. Have to or you get runtime type assertion errors
          config.webpack(config.default({}, {}), function (err, stats) {
            // wrap it all again in a try/catch because webpack requires a callback currently :(
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
            } catch (e) {
              // resolve with an error. Avoid another try/catch
              return resolve(e);
            }
            // clean exit. Best case scenario, we passed
            return resolve();
          });
        } catch (e) {
          // something failed in setup
          return resolve(e);
        }
      });
      // revert back to our original cwd directory
      process.chdir(curDir);
      // ensure the test didn't error
      assert.ok(!err, err);
    });
  }
});
