#!/usr/bin/env node
const { execSync } = require('child_process');

function run(cmd, env = {}) {
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
}

const testUrl = process.env.DATABASE_URL_TEST;
if (!testUrl) {
  console.error('❌ DATABASE_URL_TEST is required for dry-run migration.');
  process.exit(1);
}

try {
  run('pnpm -C packages/db exec prisma validate');
  run('pnpm -C packages/db exec prisma migrate deploy', { DATABASE_URL: testUrl });
  run('pnpm -C packages/db exec prisma generate', { DATABASE_URL: testUrl });
  console.log('\n✅ Migration dry-run succeeded.\n');
} catch (e) {
  console.error('\n❌ Migration dry-run failed.\n');
  process.exit(1);
}
