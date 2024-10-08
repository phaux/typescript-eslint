import fs from 'node:fs';
import path from 'node:path';

import eslintPlugin from '../src';
import rules from '../src/rules';

describe('eslint-plugin ("./src/index.ts")', () => {
  const ruleKeys = Object.keys(rules);
  const eslintPluginRuleKeys = Object.keys(eslintPlugin.rules);

  const configs = fs
    .readdirSync('./src/configs')
    .filter(file => ['.json', '.ts'].includes(path.extname(file).toLowerCase()))
    .map(file => path.basename(file, path.extname(file)));
  const eslintPluginConfigKeys = Object.keys(eslintPlugin.configs);

  it('exports all available rules', () => {
    expect(ruleKeys).toEqual(expect.arrayContaining(eslintPluginRuleKeys));
  });

  it('exports all available configs', () => {
    expect([
      ...configs,
      // This config is deprecated eventually will be removed
      'recommended-requiring-type-checking',
    ]).toEqual(expect.arrayContaining(eslintPluginConfigKeys));
  });
});
