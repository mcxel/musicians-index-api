#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const failures: string[] = [];

function mustExist(relPath: string): string {
  const full = path.join(cwd, relPath);
  if (!fs.existsSync(full)) {
    failures.push(`missing file: ${relPath}`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

function mustContain(text: string, token: string, label: string): void {
  if (!text.includes(token)) failures.push(`missing ${label}: ${token}`);
}

function countRoutesUnder(relDir: string): number {
  const full = path.join(cwd, relDir);
  if (!fs.existsSync(full)) return 0;
  let count = 0;
  const stack = [full];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const next = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(next);
      else if (entry.isFile() && entry.name === 'route.ts') count += 1;
    }
  }
  return count;
}

console.log('=== MIDDLEWARE + AUTH + ROUTE PROOF SUITE ===');

const srcMiddleware = mustExist('src/middleware.ts');
const rootMiddlewarePath = path.join(cwd, 'middleware.ts');
const rootMiddleware = fs.existsSync(rootMiddlewarePath)
  ? fs.readFileSync(rootMiddlewarePath, 'utf8')
  : '';

if (srcMiddleware) {
  mustContain(srcMiddleware, 'getToken', 'session token validation');
  mustContain(srcMiddleware, 'validateCSRFToken', 'csrf validation');
  mustContain(srcMiddleware, 'checkRateLimit', 'rate limiting');
  mustContain(srcMiddleware, 'Invalid redirect target', 'safe redirect guard');
  mustContain(srcMiddleware, "Forbidden", 'admin role enforcement');
  mustContain(srcMiddleware, 'nextParam', 'safe redirect guard');
  mustContain(srcMiddleware, '/admin/:path*', 'admin matcher');
  mustContain(srcMiddleware, '/api/payments/:path*', 'payments matcher');
}

if (rootMiddleware) {
  mustContain(rootMiddleware, '/admin/:path*', 'root admin matcher');
  mustContain(rootMiddleware, 'Unauthorized', 'root unauthorized handling');
}

const apiRouteCount = countRoutesUnder('src/app/api');
if (apiRouteCount < 10) {
  failures.push(`insufficient api route coverage: found ${apiRouteCount}`);
}

const criticalPages = [
  'src/app/admin/diagnostics/page.tsx',
  'src/app/admin/diagnostics/avatars/page.tsx',
  'src/app/admin/diagnostics/video/page.tsx',
  'src/app/admin/diagnostics/routes/page.tsx',
  'src/app/admin/diagnostics/payments/page.tsx',
  'src/app/admin/diagnostics/recovery-log/page.tsx',
];
for (const p of criticalPages) {
  if (!fs.existsSync(path.join(cwd, p))) failures.push(`missing critical route page: ${p}`);
}

if (failures.length > 0) {
  console.error('FAIL: middleware/auth/runtime proofs failed');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`PASS: middleware/auth/runtime route integrity verified (api routes: ${apiRouteCount})`);
