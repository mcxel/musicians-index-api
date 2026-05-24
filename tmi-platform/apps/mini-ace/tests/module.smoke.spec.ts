import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('smoke routes and boundaries exist for mini-ace', () => {
  const root = resolve(process.cwd(), 'apps', 'mini-ace');
  assert.equal(existsSync(resolve(root, 'app', 'api/health/route.ts')), true);
  assert.equal(existsSync(resolve(root, 'app', 'api/metrics/route.ts')), true);
  assert.equal(existsSync(resolve(root, 'security', 'module-firewall')), true);
  assert.equal(existsSync(resolve(root, 'security', 'isolation')), true);
});
