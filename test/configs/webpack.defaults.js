import shared from "./shared.js";
import _ from "lodash";

export default (outDir = undefined) =>
  _.merge({}, shared.config(outDir), {
    plugins: [new shared.PyodidePlugin()],
  });
