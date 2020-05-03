const babel = require("@babel/core");

// shorthand
function tr(code, opts) {
  return babel.transform(code, {
    filename: "/root/target.js",
    plugins: [["./", opts]],
  }).code;
}

describe("options", () => {
  test("should throw error if options is empty", () => {
    expect(() => {
      tr("import a from './b';", undefined);
    }).toThrow();
  });
  test("should throw error if options `test.importName` is empty", () => {
    expect(() => {
      tr("import a from './b';", { test: {} });
    }).toThrow();
  });
  test("should throw error if options `stubTo` is empty", () => {
    expect(() => {
      tr("import a from './b';", { test: { importName: "^a$" } });
    }).toThrow();
  });
  test("should not throw error if options is valid", () => {
    expect(() => {
      tr("import a from './b';", {
        test: { importName: "^a$" },
        stubTo: "c",
      });
    }).not.toThrow();
  });
  test("should not throw error if options is valid with multiple condition by `rules` array", () => {
    expect(() => {
      tr("import a from './b';", {
        rules: [{ test: { importName: "^a$" }, stubTo: "c" }],
      });
    }).not.toThrow();
  });
});

describe("transform", () => {
  test("should not be replace if no matched conditions", () => {
    const code = tr("import a from './b';", {
      test: { importName: "noMatchImportName" },
      stubTo: "stubTo",
    });
    const expected = "import a from './b';";
    expect(code).toBe(expected);
  });

  test("should be replace if import name matched with default import", () => {
    const code = tr("import a from './b';", {
      test: { importName: "^a$" },
      stubTo: "c",
    });
    const expected = `\
import './b';
import a from 'c';`;
    expect(code).toBe(expected);
  });

  test("should be replace when import name matched with named import", () => {
    const code = tr("import { a } from './b';", {
      test: { importName: "^a$" },
      stubTo: "c",
    });
    const expected = `\
import './b';
import a from 'c';`;
    expect(code).toBe(expected);
  });

  test("should be replace when import name matched from multi import specifiers", () => {
    const code = tr("import remain1, { remain2, a, remain3 } from './b';", {
      test: { importName: "^a$" },
      stubTo: "c",
    });
    const expected = `\
import remain1, { remain2, remain3 } from './b';
import a from 'c';`;
    expect(code).toBe(expected);
  });

  test("should be replace when import name matched and import path matched", () => {
    const code = tr("import { a } from '../components/b';", {
      test: { importName: "^a$", importPath: "\\/components\\/" },
      stubTo: "c",
    });
    const expected = `\
import '../components/b';
import a from 'c';`;
    expect(code).toBe(expected);
  });

  test("should not be replace when import name matched but import path unmatched", () => {
    const code = tr("import { a } from '../components/b';", {
      test: { importName: "^a$", importPath: "\\/AAA\\/" },
      stubTo: "c",
    });
    const expected = "import { a } from '../components/b';";
    expect(code).toBe(expected);
  });
});
