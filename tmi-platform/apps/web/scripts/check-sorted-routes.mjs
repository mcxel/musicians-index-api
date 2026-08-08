import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { getSortedRoutes } = require('next/dist/shared/lib/router/utils/sorted-routes');
const APP = path.resolve('src/app');
function collect(dir, base = '') {
  let out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.posix.join(base.replace(/\\/g, '/'), ent.name);
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) { out = out.concat(collect(full, rel)); continue; }
    if (!/^(page|route)\.(t|j)sx?$/.test(ent.name)) continue;
    let r = '/' + base.replace(/\\/g, '/');
    r = r.replace(/\/\([^)]+\)/g, '');
    r = r.replace(/\/+$/, '') || '/';
    out.push(r);
  }
  return out;
}
const routes = [...new Set(collect(APP))].sort();
console.log('BEATS ROUTES:');
for (const r of routes.filter((x) => x.includes('beats'))) console.log(' ', r);
try {
  getSortedRoutes(routes);
  console.log('sorted-routes OK (' + routes.length + ' routes)');
} catch (e) {
  console.error('SORTED-ROUTES FAIL:', e.message);
  process.exit(1);
}
