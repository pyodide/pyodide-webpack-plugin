import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  { ignores: ["node_modules/", "dist/"] },
  {
    files: ["**/*.{ts, js}"],
    languageOptions: {
      parser: tsparser,
      sourceType: "module",
      globals: {
        describe: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        it: "readonly",
      },
    },

    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
    },

    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      "no-constant-condition": 0,
      "@typescript-eslint/no-var-requires": 0,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_{1,}$",
          varsIgnorePattern: "^_{1,}$",
          caughtErrorsIgnorePattern: "^_{1,}$",
        },
      ],
      "@typescript-eslint/ban-ts-comment": 0,
    },
  },
];
