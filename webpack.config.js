import { umd, esm, loader } from "./webpack/index.js";

// webpack config
export default async (env, argv) => {
  return [esm(env, argv), umd(env, argv), await loader(env, argv)];
};
