import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('smoke routes and boundaries exist for hot-screens', () => {
  const root = resolve(process.cwd(), 'apps', 'hot-screens');
  assert.equal(existsSync(resolve(root, 'app', 'api/health/route.ts')), true);
  assert.equal(existsSync(resolve(root, 'app', 'api/metrics/route.ts')), true);
  assert.equal(existsSync(resolve(root, 'security', 'module-firewall')), true);
  assert.equal(existsSync(resolve(root, 'security', 'isolation')), true);
});
