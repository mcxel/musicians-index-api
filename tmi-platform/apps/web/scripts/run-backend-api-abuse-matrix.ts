#!/usr/bin/env tsx
import { execSync } from 'node:child_process';

type Check = { name: string; cmd: string };

const checks: Check[] = [
  { name: 'stripe-webhook-abuse-matrix', cmd: 'pnpm exec tsx src/lib/stripe/stripe-proof.ts' },
  { name: 'middleware-auth-runtime-proof', cmd: 'pnpm exec tsx scripts/validate-middleware-auth-runtime.ts' },
  { name: 'governance-static-bypass-proof', cmd: 'pnpm exec tsx scripts/scan-static-fallbacks.ts' },
];

const failures: string[] = [];

console.log('=== BACKEND/API ABUSE MATRIX ===');
for (const c of checks) {
  try {
    console.log(`\\n[RUN] ${c.name}`);
    execSync(c.cmd, { stdio: 'inherit' });
    console.log(`[PASS] ${c.name}`);
  } catch {
    failures.push(c.name);
    console.error(`[FAIL] ${c.name}`);
  }
}

if (failures.length > 0) {
  console.error('\\nFAIL: backend/api abuse matrix blocked');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('\\nPASS: backend/api abuse matrix all green');
