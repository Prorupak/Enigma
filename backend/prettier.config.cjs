/** @type {import('prettier').Config} */
module.exports = {
  endOfLine: "lf",
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 80,
  arrowParens: "avoid",
  importOrder: [
    "^(express/(.*)$)|^(express$)",
    "<THIRD_PARTY_MODULES>",
    "^types$",
    "^[./]",
  ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
  importOrderBuiltinModulesToTop: true,
  importOrderParserPlugins: ["typescript", "decorators-legacy"],
  importOrderMergeDuplicateImports: false,
  importOrderCombineTypeAndValueImports: false,
  importOrderRemoveUnusedImports: true,
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
};
