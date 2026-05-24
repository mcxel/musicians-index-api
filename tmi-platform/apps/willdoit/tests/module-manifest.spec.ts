import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('module manifest exists for willdoit', () => {
  const root = resolve(process.cwd(), 'apps', 'willdoit');
  assert.equal(existsSync(resolve(root, 'config', 'module.config.ts')), true);
});
