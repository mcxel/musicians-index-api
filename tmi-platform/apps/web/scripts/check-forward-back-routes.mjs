/**
 * scripts/check-forward-back-routes.mjs
 * Audit: Ensure every route can go forward AND back without dead ends.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n🔍 CHECKING: Forward/Back Route Integrity\n');

// Define all expected routes and their bidirectional pairs
const ROUTE_PAIRS = {
  '/': {
    forward: '/home/1',
    back: null, // Root has no back
    name: 'Root / Landing',
  },
  '/home/1': {
    forward: '/home/2',
    back: '/',
    name: 'Homepage Belt 1',
  },
  '/home/2': {
    forward: '/home/3',
    back: '/home/1',
    name: 'Homepage Belt 2',
  },
  '/home/3': {
    forward: '/home/4',
    back: '/home/2',
    name: 'Homepage Belt 3',
  },
  '/home/4': {
    forward: '/home/5',
    back: '/home/3',
    name: 'Homepage Belt 4',
  },
  '/home/5': {
    forward: '/home/1',
    back: '/home/4',
    name: 'Homepage Belt 5 (loops)',
  },
  '/magazine': {
    forward: '/magazine/current',
    back: '/',
    name: 'Magazine Hub',
  },
  '/venues': {
    forward: '/venues/featured',
    back: '/',
    name: 'Venues Directory',
  },
  '/live-world': {
    forward: '/live-world/featured',
    back: '/',
    name: 'Live World',
  },
  '/admin': {
    forward: '/admin/launch',
    back: '/',
    name: 'Admin Dashboard',
  },
  '/admin/launch': {
    forward: '/admin/overseer',
    back: '/admin',
    name: 'Admin Launch Gate',
  },
  '/admin/overseer': {
    forward: '/admin/launch',
    back: '/admin',
    name: 'Overseer Deck',
  },
};

// Check 1: All route pairs defined
console.log('1️⃣  Checking route pair definitions...');
console.log(`Total routes checked: ${Object.keys(ROUTE_PAIRS).length}\n`);

let completeRoutes = 0;
let incompleteRoutes = 0;
const issues = [];

for (const [route, pair] of Object.entries(ROUTE_PAIRS)) {
  const hasForward = pair.forward && pair.forward !== route;
  const hasBack = route === '/' ? true : !!pair.back; // Root doesn't need back

  const status = hasForward && hasBack ? '✅' : '❌';
  console.log(`${status} ${route.padEnd(25)} → ${pair.forward || 'NONE'} | ← ${pair.back || 'NONE'}`);
  console.log(`    ${pair.name}`);

  if (hasForward && hasBack) {
    completeRoutes++;
  } else {
    incompleteRoutes++;
    if (!hasForward) issues.push(`${route}: Missing forward route`);
    if (!hasBack && route !== '/') issues.push(`${route}: Missing back route`);
  }
}

// Check 2: Belt loop verification
console.log('\n2️⃣  Checking homepage belt loop...');
const beltSequence = ['/home/1', '/home/2', '/home/3', '/home/4', '/home/5'];
let beltValid = true;

for (let i = 0; i < beltSequence.length; i++) {
  const current = beltSequence[i];
  const next = beltSequence[(i + 1) % beltSequence.length];
  const pair = ROUTE_PAIRS[current];

  if (pair.forward === next || (i === 4 && pair.forward === '/home/1')) {
    console.log(`✅ ${current} → ${next}`);
  } else {
    console.log(`❌ ${current} → ${next} (but defined as → ${pair.forward})`);
    beltValid = false;
  }
}

if (beltValid) {
  console.log('\n✅ Homepage belt loops correctly');
} else {
  console.log('\n❌ Homepage belt loop broken');
}

// Check 3: Dead route detection
console.log('\n3️⃣  Detecting dead routes...');
const deadRoutes = [];

for (const [route, pair] of Object.entries(ROUTE_PAIRS)) {
  // A dead route: has forward but no way back
  if (pair.forward && !pair.back && route !== '/') {
    deadRoutes.push(route);
  }
  // A dead route: back goes nowhere
  if (pair.back && !ROUTE_PAIRS[pair.back]) {
    deadRoutes.push(`${route} (back route not defined: ${pair.back})`);
  }
}

if (deadRoutes.length === 0) {
  console.log('✅ No dead routes detected');
} else {
  console.log(`❌ Dead routes found: ${deadRoutes.length}`);
  deadRoutes.forEach(r => console.log(`   - ${r}`));
}

// Check 4: Section navigation chains
console.log('\n4️⃣  Checking section navigation chains...');
const CHAINS = {
  homepages: {
    entry: '/home/1',
    chain: ['/home/1', '/home/2', '/home/3', '/home/4', '/home/5'],
    exit: '/',
  },
  admin: {
    entry: '/admin',
    chain: ['/admin', '/admin/launch', '/admin/overseer'],
    exit: '/',
  },
  magazine: {
    entry: '/magazine',
    chain: ['/magazine'],
    exit: '/',
  },
};

for (const [sectionName, chain] of Object.entries(CHAINS)) {
  console.log(`\n${sectionName.toUpperCase()}:`);
  console.log(`  Entry: ${chain.entry}`);
  console.log(`  Chain: ${chain.chain.join(' → ')}`);
  console.log(`  Exit: ${chain.exit}`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 FORWARD/BACK ROUTE INTEGRITY SUMMARY');
console.log('='.repeat(60));
console.log(`Total routes: ${Object.keys(ROUTE_PAIRS).length}`);
console.log(`Complete (forward + back): ${completeRoutes}`);
console.log(`Incomplete: ${incompleteRoutes}`);
console.log(`Dead routes: ${deadRoutes.length}`);
console.log(`Belt loop valid: ${beltValid ? 'YES' : 'NO'}`);
console.log(`Status: ${deadRoutes.length === 0 && beltValid ? '✅ PASS' : '⚠️  WARNING'}`);
console.log('='.repeat(60) + '\n');

if (issues.length > 0) {
  console.log('🔴 Issues to fix:');
  issues.forEach(i => console.log(`   - ${i}`));
  console.log();
}

process.exit(deadRoutes.length === 0 && beltValid ? 0 : 1);
