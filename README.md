# babel-plugin-stub-import

[![npm-version](https://img.shields.io/npm/v/babel-plugin-stub-import.svg?style=flat-square)](https://npmjs.org/package/babel-plugin-stub-import)
[![downloads](http://img.shields.io/npm/dm/babel-plugin-stub-import.svg?style=flat-square)](https://npmjs.org/package/babel-plugin-stub-import)
[![circleci](https://img.shields.io/circleci/build/github/keik/babel-plugin-stub-import?style=flat-square)](https://app.circleci.com/pipelines/github/keik/babel-plugin-stub-import)
[![codecov](https://codecov.io/gh/keik/babel-plugin-stub-import/branch/master/graph/badge.svg)](https://codecov.io/gh/keik/babel-plugin-stub-import)

Test importing variable specifier and filepath, then replace to stub.

## Limitation

Stub is imported from *default export*, named exports is unavailable.

## Usage

babel.config.js

```js
module.exports = {
  "plugins": [
    [
      "babel-plugin-stub-import",
      {
        "test": {
          "importName": "^foo$",
        },
        "stubTo": "<rootDir>/Stub"
      }
    ]
  ]
}
```

Input

```js
import bar, { foo, baz, foo as qux } from './bar;

foo();
```

Output

```js
import bar, { baz, foo as qux } from './bar'; // unmatched specifiers are imported fron original
import foo from './Stub';                     // matched specifier is imported from stub

foo();                                        // import is stubbed but specifier is preserved.
```

For details, see [tests](./index.test.js)

## Options

| Name | Type | Description|
|---|---|---|
| `test.importName` | `string\|RegExp` | Pattern to test import name and replace stub if matched. |
| `test.importPath` | `string\|RegExp` | Pattern to test import path and replace stub if matched. |
| `stubTo` | `string` | String to replace stub module. `<rootDir>` is replaced to root directory path. |
