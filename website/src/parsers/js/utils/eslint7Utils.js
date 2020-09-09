import compileModule from '../../utils/compileModule';
import transpile from '../../transpilers/babel';
import {parse} from '@babel/eslint-parser';

export function formatResults(results) {
  return results.length === 0
    ? '// Lint rule not fired.'
    : results.map(formatResult).join('').trim();
}

export function formatResult(result) {
  var pointer = '-'.repeat(result.column - 1) + '^';
  return `
// ${result.message} (at ${result.line}:${result.column})
   ${result.source}
// ${pointer}
`;
}

export function defineRule(eslint, code) {
  // Compile the transform code and install it as an ESLint rule. The rule
  // name doesn't really matter here, so we'll just use a hard-coded name.
  code = transpile(code);
  const rule = compileModule(code);
    eslint.defineRule('astExplorerRule', rule.default || rule);
}

export function runRule(code, eslint) {
  // Run the ESLint rule on the AST of the provided code.
  // Reference: http://eslint.org/docs/developer-guide/nodejs-api
  eslint.defineParser('@babel/eslint-parser', {
    parse(code) {
      return parse(code, {
        sourceType: 'module',
        requireConfigFile: false,
      });
    },
  });
  const results = eslint.verifyAndFix(code, {
    env: {es6: true},
    parser: '@babel/eslint-parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {experimentalObjectRestSpread: true},
    },
    rules: {
      astExplorerRule: 2,
    },
  });
  let output = formatResults(results.messages);
  output += `

// Fixed output follows:
// ${ '-'.repeat(80) }
`;
  return output + results.output;
}
