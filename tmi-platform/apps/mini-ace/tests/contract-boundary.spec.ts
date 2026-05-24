import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('contract boundary exists for mini-ace', () => {
  const root = resolve(process.cwd(), 'apps', 'mini-ace');
  assert.equal(existsSync(resolve(root, 'contracts')), true);
  assert.equal(existsSync(resolve(root, 'adapters')), true);
});
