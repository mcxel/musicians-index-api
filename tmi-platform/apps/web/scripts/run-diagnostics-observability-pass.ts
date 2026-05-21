#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const failures: string[] = [];

const pages = [
  'src/app/admin/diagnostics/page.tsx',
  'src/app/admin/diagnostics/avatars/page.tsx',
  'src/app/admin/diagnostics/video/page.tsx',
  'src/app/admin/diagnostics/routes/page.tsx',
  'src/app/admin/diagnostics/payments/page.tsx',
  'src/app/admin/diagnostics/recovery-log/page.tsx',
];

function mustExistAndRead(relPath: string): string {
  const full = path.join(cwd, relPath);
  if (!fs.existsSync(full)) {
    failures.push(`missing diagnostics page: ${relPath}`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

console.log('=== DIAGNOSTICS OBSERVABILITY PASS ===');

const combined = pages.map(mustExistAndRead).join('\n');

const requiredSignals = [
  'severity',
  'recovery',
  'telemetry',
  'diagnostic',
  'error',
  'route',
  'payment',
  'video',
  'avatar',
];

for (const token of requiredSignals) {
  if (!combined.toLowerCase().includes(token)) {
    failures.push(`missing observability signal: ${token}`);
  }
}

if (!combined.toLowerCase().includes('replay')) {
  failures.push('missing replay attack visibility on diagnostics surfaces');
}

if (failures.length > 0) {
  console.error('FAIL: diagnostics observability pass failed');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('PASS: diagnostics observability surfaces verified');
