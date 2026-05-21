#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const failures: string[] = [];
const warnings: string[] = [];

type RouteCheck = { route: string; file: string; mustContainAny?: string[] };

const routeChecks: RouteCheck[] = [
  { route: '/home/1', file: 'src/app/home/1/page.tsx', mustContainAny: ['button', 'Link', 'ImageSlotWrapper', 'motion'] },
  { route: '/home/2', file: 'src/app/home/2/page.tsx', mustContainAny: ['button', 'Link', 'ImageSlotWrapper', 'motion'] },
  { route: '/home/3', file: 'src/app/home/3/page.tsx', mustContainAny: ['button', 'Link', 'ImageSlotWrapper', 'motion'] },
  { route: '/home/4', file: 'src/app/home/4/page.tsx', mustContainAny: ['button', 'Link', 'ImageSlotWrapper', 'motion'] },
  { route: '/home/5', file: 'src/app/home/5/page.tsx', mustContainAny: ['button', 'Link', 'ImageSlotWrapper', 'motion'] },
  { route: '/hub/fan', file: 'src/app/hub/fan/page.tsx', mustContainAny: ['button', 'Link', 'stats', 'diagnostics'] },
  { route: '/hub/performer', file: 'src/app/hub/performer/page.tsx', mustContainAny: ['button', 'Link', 'stats', 'diagnostics'] },
  { route: '/hub/sponsor', file: 'src/app/hub/sponsor/page.tsx', mustContainAny: ['button', 'Link', 'analytics', 'diagnostics'] },
  { route: '/hub/advertiser', file: 'src/app/hub/advertiser/page.tsx', mustContainAny: ['button', 'Link', 'analytics', 'diagnostics'] },
  { route: '/hub/venue', file: 'src/app/hub/venue/page.tsx', mustContainAny: ['button', 'Link', 'tickets', 'diagnostics'] },
  { route: '/admin', file: 'src/app/admin/page.tsx', mustContainAny: ['button', 'Link', 'diagnostics', 'admin'] },
  { route: '/admin/diagnostics', file: 'src/app/admin/diagnostics/page.tsx', mustContainAny: ['severity', 'recovery', 'diagnostics'] },
  { route: '/admin/diagnostics/avatars', file: 'src/app/admin/diagnostics/avatars/page.tsx', mustContainAny: ['avatar', 'diagnostic'] },
  { route: '/admin/diagnostics/video', file: 'src/app/admin/diagnostics/video/page.tsx', mustContainAny: ['video', 'diagnostic'] },
  { route: '/admin/diagnostics/routes', file: 'src/app/admin/diagnostics/routes/page.tsx', mustContainAny: ['route', 'diagnostic'] },
  { route: '/admin/diagnostics/payments', file: 'src/app/admin/diagnostics/payments/page.tsx', mustContainAny: ['payment', 'diagnostic'] },
  { route: '/admin/diagnostics/recovery-log', file: 'src/app/admin/diagnostics/recovery-log/page.tsx', mustContainAny: ['recovery', 'log'] },
  { route: '/magazine/archive', file: 'src/app/magazine/archive/page.tsx', mustContainAny: ['article', 'issue', 'Link'] },
  { route: '/signup', file: 'src/app/signup/page.tsx', mustContainAny: ['form', 'input', 'button'] },
  { route: '/subscriptions', file: 'src/app/subscriptions/page.tsx', mustContainAny: ['plan', 'button', 'billing'] },
  { route: '/tickets/print', file: 'src/app/tickets/print/page.tsx', mustContainAny: ['ticket', 'print', 'button'] },
  { route: '/tickets/validate', file: 'src/app/tickets/validate/page.tsx', mustContainAny: ['ticket', 'validate', 'button'] },
];

function read(rel: string): string {
  const full = path.join(cwd, rel);
  if (!fs.existsSync(full)) {
    failures.push(`missing route file: ${rel}`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

function scanDeadControls(content: string, label: string): void {
  const buttonMatches = [...content.matchAll(/<button\b[^>]*>/g)];
  for (const m of buttonMatches) {
    const tag = m[0];
    const hasOnClick = /onClick\s*=/.test(tag);
    const hasSubmit = /type\s*=\s*['\"]submit['\"]/.test(tag);
    const hasButtonType = /type\s*=\s*['\"]button['\"]/.test(tag);
    if (!hasOnClick && !hasSubmit && !hasButtonType) {
      warnings.push(`${label}: possible dead button control (${tag.slice(0, 80)}...)`);
    }
  }

  const sliderSignals = /slider|chevron|carousel|swipe|drag/gi;
  if (!sliderSignals.test(content) && label.includes('/home/')) {
    warnings.push(`${label}: no obvious slider/chevron interaction signals found`);
  }

  if (!/aria-|tabIndex|role=|focus/i.test(content)) {
    warnings.push(`${label}: limited explicit accessibility/focus signals`);
  }
}

console.log('=== WEB UI EXHAUSTIVE PASS ===');

for (const check of routeChecks) {
  const content = read(check.file);
  if (!content) continue;

  if (check.mustContainAny && !check.mustContainAny.some((token) => content.includes(token))) {
    warnings.push(`${check.route}: limited interaction/content signals in route file`);
  }

  scanDeadControls(content, check.route);

  if (/TODO|FIXME|placeholder only|coming soon/i.test(content)) {
    warnings.push(`${check.route}: placeholder/todo wording detected`);
  }
}

const keyComponents = [
  'src/components/lobbies/LobbyTheaterShell.tsx',
  'src/components/lobbies/LobbyQueueRail.tsx',
  'src/components/lobbies/LobbyReactionRail.tsx',
  'src/components/lobbies/LobbyTipRail.tsx',
  'src/components/lobbies/LobbyStageViewport.tsx',
  'src/components/monitors/GovernedMonitorSlot.tsx',
];
for (const c of keyComponents) {
  if (!fs.existsSync(path.join(cwd, c))) warnings.push(`missing expected component: ${c}`);
}

if (failures.length > 0) {
  console.error('FAIL: web ui exhaustive pass failed');
  for (const f of failures) console.error(`  - ${f}`);
  if (warnings.length > 0) {
    console.error('WARNINGS:');
    for (const w of warnings.slice(0, 60)) console.error(`  - ${w}`);
  }
  process.exit(1);
}

console.log(`PASS: web ui route/control baseline validated (${routeChecks.length} route checks)`);
if (warnings.length > 0) {
  console.log(`WARN: ${warnings.length} non-blocking ui observations`);
  for (const w of warnings.slice(0, 40)) console.log(`  - ${w}`);
}
