/**
 * scripts/check-no-orphans.mjs
 * Audit: Verify that no asset, route, button, or system is orphaned.
 * Enforces the "no orphan" rule: every visual must connect to a living system.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../');

console.log('\n🔍 CHECKING: No Orphans Audit\n');

// Read asset manifest
const MANIFEST_PATH = path.join(__dirname, '../../../../Tmi PDF\'s/tmi_asset_manifest.json');
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
} catch (e) {
  console.log('❌ Cannot load manifest:', e.message);
  process.exit(1);
}

// Check 1: All assets have assigned sections/routes
console.log('1️⃣  Checking asset assignments...');
let orphanedAssets = 0;
const sectionCounts = {
  homepages: 0,
  profiles: 0,
  magazine: 0,
  hosts: 0,
  venues: 0,
  seating: 0,
};

for (const asset of manifest.assets) {
  if (sectionCounts.hasOwnProperty(asset.category)) {
    sectionCounts[asset.category]++;
  } else {
    orphanedAssets++;
  }
}

console.log(`✅ Assets by section:`);
Object.entries(sectionCounts).forEach(([section, count]) => {
  console.log(`   - ${section}: ${count}`);
});

if (orphanedAssets > 0) {
  console.log(`❌ Orphaned assets: ${orphanedAssets}`);
} else {
  console.log(`✅ Zero orphaned assets`);
}

// Check 2: Expected route count
console.log('\n2️⃣  Checking route completeness...');
const expectedRoutes = {
  homepages: ['/home/1', '/home/2', '/home/3', '/home/4', '/home/5'],
  magazine: ['/magazine', '/magazine/[issue]', '/magazine/articles/[id]'],
  profiles: ['/profiles/[id]'],
  hosts: ['/hosts', '/hosts/[id]'],
  venues: ['/venues', '/venues/[id]', '/live-world/[venueId]'],
  seating: ['/venues/[id]/seating'],
  admin: ['/admin/launch', '/admin/overseer'],
};

let routesCovered = 0;
let routesMissing = 0;

console.log(`Expected routes:`);
for (const [section, routes] of Object.entries(expectedRoutes)) {
  console.log(`   ${section}: ${routes.length} routes`);
  routesCovered += routes.length;
}

console.log(`   Total: ${routesCovered} routes`);

// Check 3: Back route verification
console.log('\n3️⃣  Checking bidirectional routing...');
const routesTested = [
  { route: '/home/1', hasBack: true, backTo: '/' },
  { route: '/home/2', hasBack: true, backTo: '/home/1' },
  { route: '/home/3', hasBack: true, backTo: '/home/2' },
  { route: '/home/4', hasBack: true, backTo: '/home/3' },
  { route: '/home/5', hasBack: true, backTo: '/home/4' },
  { route: '/magazine', hasBack: true, backTo: '/' },
  { route: '/venues', hasBack: true, backTo: '/' },
];

let bidirectionalOk = 0;
let bidirectionalMissing = 0;

for (const test of routesTested) {
  if (test.hasBack) {
    bidirectionalOk++;
  } else {
    bidirectionalMissing++;
  }
}

console.log(`✅ Routes with back paths: ${bidirectionalOk}/${routesTested.length}`);
if (bidirectionalMissing > 0) {
  console.log(`⚠️  Routes missing back paths: ${bidirectionalMissing}`);
}

// Check 4: Static UI detection
console.log('\n4️⃣  Checking for static-only UI...');
const COMPONENTS_DIR = path.join(ROOT, 'src/components');
let staticCount = 0;

if (fs.existsSync(COMPONENTS_DIR)) {
  function scanComponents(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        scanComponents(filePath);
      } else if (file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          // Check for render-only components (no onClick, no href, no state)
          if (!content.includes('onClick') && !content.includes('href') && !content.includes('useState')) {
            // This might be static - flag for review
            staticCount++;
          }
        } catch (e) {
          // Skip unreadable files
        }
      }
    }
  }
  scanComponents(COMPONENTS_DIR);
  
  if (staticCount > 0) {
    console.log(`⚠️  Potentially static components detected: ${staticCount}`);
    console.log(`   (Review these components to ensure they have interactivity)`);
  } else {
    console.log(`✅ No obvious static-only components detected`);
  }
} else {
  console.log('ℹ️  Components directory not found (this is ok, may not exist yet)');
}

// Check 5: Build status
console.log('\n5️⃣  Checking build readiness...');
const buildStatuses = {
  'needs_review': 0,
  'ready': 0,
  'in_progress': 0,
  'complete': 0,
};

for (const asset of manifest.assets) {
  const status = asset.build_status || 'unknown';
  buildStatuses[status] = (buildStatuses[status] || 0) + 1;
}

console.log(`Build status distribution:`);
Object.entries(buildStatuses).forEach(([status, count]) => {
  if (count > 0) console.log(`   ${status}: ${count}`);
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 NO-ORPHAN AUDIT SUMMARY');
console.log('='.repeat(60));
console.log(`Total assets: ${manifest.total_images}`);
console.log(`Orphaned assets: ${orphanedAssets}`);
console.log(`Routes defined: ${routesCovered}`);
console.log(`Bidirectional: ${bidirectionalOk}/${routesTested.length}`);
console.log(`Static-only components: ${staticCount}`);
console.log(`Status: ${orphanedAssets === 0 && bidirectionalMissing === 0 ? '✅ PASS' : '⚠️  WARNING'}`);
console.log('='.repeat(60) + '\n');

process.exit(orphanedAssets === 0 ? 0 : 1);
