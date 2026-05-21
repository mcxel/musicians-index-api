#!/usr/bin/env tsx
import { execSync } from 'node:child_process';

type Gate = { name: string; cmd: string };

const gates: Gate[] = [
  { name: 'web-ui-exhaustive-pass', cmd: 'pnpm exec tsx scripts/run-web-ui-exhaustive-pass.ts' },
  { name: 'backend-api-abuse-matrix', cmd: 'pnpm exec tsx scripts/run-backend-api-abuse-matrix.ts' },
  { name: 'compile', cmd: 'pnpm exec tsc --noEmit' },
  { name: 'wrapper-authenticity', cmd: 'pnpm exec tsx scripts/scan-runtime-wrapper-authenticity.ts' },
  { name: 'static-bypass-scan', cmd: 'pnpm exec tsx scripts/scan-static-fallbacks.ts' },
  { name: 'unified-gate-runner', cmd: 'pnpm exec tsx scripts/gate-runner-unified-validator.ts' },
  { name: 'runtime-survivability', cmd: 'pnpm exec tsx scripts/run-runtime-survivability-suite.ts' },
  { name: 'diagnostics-observability', cmd: 'pnpm exec tsx scripts/run-diagnostics-observability-pass.ts' },
];

const failures: string[] = [];

console.log('=== GEMINI FINAL PROOF GATES ===');
for (const gate of gates) {
  try {
    console.log(`\n[RUN] ${gate.name}`);
    execSync(gate.cmd, { stdio: 'inherit' });
    console.log(`[PASS] ${gate.name}`);
  } catch {
    failures.push(gate.name);
    console.error(`[FAIL] ${gate.name}`);
  }
}

if (failures.length > 0) {
  console.error('\nFAIL: Gemini final proof gates blocked');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('\nPASS: Gemini final proof gates all green');
