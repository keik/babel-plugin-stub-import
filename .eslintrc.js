module.exports = {
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
  env: {
    es6: true,
    jest: true,
    node: true,
  },
  extends: [
    "eslint:recommended",

    // put prettier at last to disable invalid rules.
    "plugin:prettier/recommended",
  ],
};
