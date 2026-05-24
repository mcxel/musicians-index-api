import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('contract boundary exists for bernoutglobal-llc', () => {
  const root = resolve(process.cwd(), 'apps', 'bernoutglobal-llc');
  assert.equal(existsSync(resolve(root, 'contracts')), true);
  assert.equal(existsSync(resolve(root, 'adapters')), true);
});
