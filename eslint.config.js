// eslint.config.js

import js from "@eslint/js";

export default [
  {
    files: ["public/js/**/*.js"], // Frontend browser code
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: true,
        document: true,
        FormData: true,
        console: true,
        axios: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn",
      "no-console": "off",
      semi: ["error", "always"],
      quotes: ["error", "single"],
      indent: ["error", 2],
      eqeqeq: "warn",
    },
  },
  {
    files: ["app.js", "routes/**/*.js"], // Node.js backend code
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        process: true,
        __dirname: true,
        module: true,
        require: true,
        console: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn",
      semi: ["error", "always"],
      quotes: ["error", "single"],
      indent: ["error", 2],
      eqeqeq: "warn",
    },
  },
];
