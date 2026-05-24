import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('module manifest exists for web', () => {
  const root = resolve(process.cwd(), 'apps', 'web');
  assert.equal(existsSync(resolve(root, 'config', 'module.config.ts')), true);
});
