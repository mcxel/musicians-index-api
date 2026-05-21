/**
 * Clears foreign Next.js build environment contamination, then spawns `next build`
 * as a child process that inherits the cleaned environment.
 *
 * WHY: `delete process.env.VAR` only affects the current Node.js process and its
 * children — not the shell that invoked this script. By spawning next build FROM
 * this script, it inherits the cleaned env instead of the contaminated shell env.
 */
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, '..');  // apps/web/

delete process.env.__NEXT_PRIVATE_STANDALONE_CONFIG;
delete process.env.NEXT_OUTPUT;
delete process.env.VERCEL;
delete process.env.VERCEL_ENV;

console.log('[TMI BUILD GUARD] Cleared foreign Next build environment contamination.');

// Locate the next.js binary (supports pnpm monorepo hoisting)
const candidates = [
  resolve(webRoot, '../../node_modules/next/dist/bin/next'),
  resolve(webRoot, 'node_modules/next/dist/bin/next'),
];
const nextBin = candidates.find(p => existsSync(p));
if (!nextBin) {
  console.error('[TMI BUILD GUARD] ERROR: Cannot locate next/dist/bin/next');
  process.exit(1);
}

// Spawn next build — inherits the cleaned process.env from this script
const child = spawn(process.execPath, [nextBin, 'build'], {
  env: process.env,
  stdio: 'inherit',
  cwd: webRoot,
});

child.on('close', code => process.exit(code ?? 1));
child.on('error', err => { console.error('[TMI BUILD GUARD]', err.message); process.exit(1); });
