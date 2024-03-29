import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const moveToExample = function (distDir, filename) {
  const exampleDir = path.resolve(__dirname, "..", "examples");
  const examples = fs.readdirSync(exampleDir, { withFileTypes: true });

  for (const example of examples) {
    if (!example.isDirectory()) {
      continue;
    }
    const outDir = path.join(exampleDir, example.name, "node_modules", "@pyodide", "webpack-plugin");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, filename), fs.readFileSync(path.join(distDir, filename)));
  }
};
