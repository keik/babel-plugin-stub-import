const cpath = require("path");

const PLUGIN_NAME = require("./package.json").name;

module.exports = function ({ parse }) {
  return {
    visitor: {
      Program(path, state) {
        state.opts = normalizeOptions(state.opts);
      },
      ImportDefaultSpecifier(path, state) {
        const importIdentifierName = path.node.local.name;
        replace(path, state, importIdentifierName, parse);
      },
      ImportSpecifier(path, state) {
        const importIdentifierName = path.node.local.name;
        replace(path, state, importIdentifierName, parse);
      },
    },
  };
};

function replace(path, state, importIdentifierName, parse) {
  // find rule to match stubbed condition
  const rule = state.opts.rules.find((rule) => {
    return (
      RegExp(rule.test.importName).test(importIdentifierName) &&
      (rule.test.importPath
        ? RegExp(rule.test.importPath).test(
            cpath.resolve(state.filename, path.parentPath.node.source.value)
          )
        : true)
    );
  });
  if (!rule) return;

  const newImportPath = rule.stubTo.replace(
    "<rootDir>",
    cpath.relative(cpath.dirname(state.filename), state.file.opts.root)
  );
  const newImportDeclNode = parse(
    `import ${importIdentifierName} from '${newImportPath}';`,
    {
      sourceType: "module",
    }
  ).program.body[0];

  // add stubbed import specifier from stubbed path
  path.parentPath.insertAfter(newImportDeclNode);
  // skip traversing inserted node
  path.parentPath.getSibling(path.parentPath.key + 1).skip();
  // remove self import specifier
  path.remove();
}

function normalizeOptions(opts) {
  const rules = Array.isArray(opts.rules) ? opts.rules : [opts];
  rules.forEach((rule) => {
    if (!rule.test)
      throw new Error(`${PLUGIN_NAME}: 'test' option is required`);
    if (!rule.test.importName && !rule.test.importPath)
      throw new Error(
        `${PLUGIN_NAME}: Either 'test.importName' or 'test.importPath' options is required`
      );
    if (!rule.stubTo)
      throw new Error(`${PLUGIN_NAME}: 'stubTo' option is required`);
  });
  return { rules };
}
