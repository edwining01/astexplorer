import pkg from 'eslint7/package.json';

const ID = 'eslint-v7';
const name = 'ESLint v7';

export default {
  id: ID,
  displayName: name,
  version: pkg.version,
  homepage: pkg.homepage,

  defaultParserID: 'babel-eslint',

  loadTransformer(callback) {
    require(
      [
        'eslint7/lib/linter',
        'eslint7/lib/source-code',
        '../../utils/eslint7Utils',
      ],
      (linter, sourceCode, utils) => callback({eslint: new linter.Linter(), sourceCode, utils}),
    );
  },

  transform({ eslint, sourceCode, utils }, transformCode, code) {
    utils.defineRule(eslint, transformCode);
    return utils.runRule(code, eslint, sourceCode);
  },
};
