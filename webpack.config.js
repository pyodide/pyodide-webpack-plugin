import { umd, esm, loader } from "./webpack/index.js";

// webpack config
export default (env, argv) => {
  return [esm(env, argv), umd(env, argv), loader(env, argv)];
};
