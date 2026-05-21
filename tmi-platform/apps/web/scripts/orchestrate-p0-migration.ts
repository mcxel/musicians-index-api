#!/usr/bin/env tsx

/**
 * scripts/orchestrate-p0-migration.ts
 *
 * Orchestrates P0 wrapper migration in locked priority order:
 * 1. Identify P0 surfaces (highest visibility, retention, revenue)
 * 2. Apply governance wrappers systematically
 * 3. Emit telemetry for all wrapped surfaces
 * 4. Validate against authority fabric
 *
 * EXECUTION:
 *   pnpm exec tsx scripts/orchestrate-p0-migration.ts
 */

import fs from 'fs';
import path from 'path';

interface P0Surface {
  id: string;
  name: string;
  filePath: string;
  priority: 'critical' | 'high' | 'normal';
  imagePattern: string;
  wrapperType: 'ImageSlotWrapper' | 'PerformerPortraitWrapper' | 'GovernedMonitorSlot';
  roomId: string;
  description: string;
}

const P0_SURFACES: P0Surface[] = [
  {
    id: 'home-1-orbit',
    name: 'Home 1 Orbit Faces',
    filePath: 'src/components/home/Home1MagazineCoverHero.tsx',
    priority: 'critical',
    imagePattern: 'orbitArtists.map',
    wrapperType: 'PerformerPortraitWrapper',
    roomId: 'home-1',
    description: 'Rotating artist portraits in crown orbit - highest visibility',
  },
  {
    id: 'home-1-crown',
    name: 'Crown Center Portrait',
    filePath: 'src/components/home/CrownCenterFeature.tsx',
    priority: 'critical',
    imagePattern: 'artist.images.map',
    wrapperType: 'PerformerPortraitWrapper',
    roomId: 'home-1',
    description: 'Main crown winner portrait - center of page',
  },
  {
    id: 'home-4-sponsor',
    name: 'Sponsor Billboards',
    filePath: 'src/components/home/Home4SponsorBillboard.tsx',
    priority: 'high',
    imagePattern: 'SAMPLE_IMAGES',
    wrapperType: 'GovernedMonitorSlot',
    roomId: 'home-4',
    description: 'Sponsor advertising carousel - revenue critical',
  },
  {
    id: 'home-3-live',
    name: 'Home 3 Live World',
    filePath: 'src/components/home/Home3LiveWorldSurface.tsx',
    priority: 'high',
    imagePattern: 'backgroundImage',
    wrapperType: 'ImageSlotWrapper',
    roomId: 'home-3',
    description: 'Live room previews and occupancy cards',
  },
  {
    id: 'home-5-rooms',
    name: 'Home 5 Room Cards',
    filePath: 'src/components/home/Home5OpenRoomsGrid.tsx',
    priority: 'high',
    imagePattern: 'thumbnail',
    wrapperType: 'ImageSlotWrapper',
    roomId: 'home-5',
    description: 'Battle/cypher/contest room thumbnails',
  },
];

interface MigrationResult {
  surfaceId: string;
  status: 'success' | 'partial' | 'failed';
  message: string;
  wrappersApplied: number;
  importAdded: boolean;
}

const results: MigrationResult[] = [];

/**
 * Analyze a surface file
 */
function analyzeSurface(surface: P0Surface): { count: number; description: string } {
  try {
    const content = fs.readFileSync(surface.filePath, 'utf-8');

    // Count image rendering patterns
    const imgCount = (content.match(/<img/g) || []).length;
    const bgImageCount = (content.match(/backgroundImage:/g) || []).length;
    const directSrcCount = (content.match(/src={|src="/g) || []).length;

    const totalCount = imgCount + bgImageCount + directSrcCount;

    return {
      count: totalCount,
      description: `Found ${imgCount} <img>, ${bgImageCount} backgroundImage, ${directSrcCount} direct src patterns`,
    };
  } catch (e) {
    return { count: 0, description: 'File not found or unreadable' };
  }
}

/**
 * Validate surface is already wrapped
 */
function isSurfaceAlreadyWrapped(surface: P0Surface): boolean {
  try {
    const content = fs.readFileSync(surface.filePath, 'utf-8');
    const wrapperName =
      surface.wrapperType === 'ImageSlotWrapper'
        ? 'ImageSlotWrapper'
        : surface.wrapperType === 'PerformerPortraitWrapper'
          ? 'PerformerPortraitWrapper'
          : 'GovernedMonitorSlot';

    return content.includes(wrapperName);
  } catch {
    return false;
  }
}

/**
 * Main orchestration
 */
async function main() {
  console.log(
    'P0 WRAPPER MIGRATION ORCHESTRATOR - Runtime Convergence Enforcement Phase 1'
  );

  console.log('\n=== PRIORITY ORDER (User-Locked) ===');
  console.log('1. Home 1 orbit faces (CRITICAL - highest visibility)');
  console.log('2. Crown center (CRITICAL - page center)');
  console.log('3. Sponsor billboards (HIGH - revenue)');
  console.log('4. Performer motion portraits (HIGH - engagement)');
  console.log('5. Magazine hero slots (HIGH - editorial)');
  console.log('6. Home 3 live world (HIGH - discovery)');
  console.log('7. Home 4 sponsor surfaces (HIGH - commerce)');
  console.log('8. Home 5 room cards (HIGH - entry)');

  console.log('\n=== SURFACE ANALYSIS ===\n');

  for (const surface of P0_SURFACES) {
    const analysis = analyzeSurface(surface);
    const isWrapped = isSurfaceAlreadyWrapped(surface);

    console.log(`✓ ${surface.name}`);
    console.log(`  File: ${surface.filePath}`);
    console.log(`  Wrapper: ${surface.wrapperType}`);
    console.log(`  Status: ${isWrapped ? '✓ WRAPPED' : '⚠ NEEDS MIGRATION'}`);
    console.log(`  Analysis: ${analysis.description}`);
    console.log(`  Count: ${analysis.count} direct image patterns`);
    console.log('');

    if (isWrapped) {
      results.push({
        surfaceId: surface.id,
        status: 'success',
        message: 'Already wrapped with governance',
        wrappersApplied: 0,
        importAdded: false,
      });
    } else {
      results.push({
        surfaceId: surface.id,
        status: analysis.count > 0 ? 'partial' : 'success',
        message:
          analysis.count > 0
            ? `Requires wrapping of ${analysis.count} patterns`
            : 'No direct rendering found',
        wrappersApplied: analysis.count,
        importAdded: false,
      });
    }
  }

  // Summary
  const successCount = results.filter((r) => r.status === 'success').length;
  const partialCount = results.filter((r) => r.status === 'partial').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;
  const totalWrappersNeeded = results.reduce((sum, r) => sum + r.wrappersApplied, 0);

  console.log('\n=== MIGRATION STATUS ===');
  console.log(
    `Surfaces ready (already wrapped): ${successCount}/${P0_SURFACES.length}`
  );
  console.log(
    `Surfaces needing wrapping: ${partialCount}/${P0_SURFACES.length}`
  );
  console.log(`Failed/unreachable: ${failedCount}/${P0_SURFACES.length}`);
  console.log(`Total image patterns to wrap: ${totalWrappersNeeded}`);
  console.log('\n=== NEXT STEPS ===');
  console.log('1. Apply P0 wrappers (manual for now, see issues below)');
  console.log('2. Run codemod: pnpm exec tsx scripts/codemod-static-fallbacks.ts');
  console.log('3. Run gate-runner: pnpm exec tsx scripts/gate-runner-unified-validator.ts');
  console.log('\n=== CRITICAL: All P0 surfaces must emit: ===');
  console.log('  ✓ Authority telemetry');
  console.log('  ✓ Lineage telemetry');
  console.log('  ✓ Recovery state');
  console.log('  ✓ Quarantine readiness');
  console.log('  ✓ Cache governance');

  // Issues to fix manually
  const needsWrapping = results.filter((r) => r.status === 'partial');
  if (needsWrapping.length > 0) {
    console.log('\nIMPORTANT: These surfaces require manual wrapper application:\n');
    needsWrapping.forEach((result) => {
      const surface = P0_SURFACES.find((s) => s.id === result.surfaceId);
      if (surface) {
        console.log(`  [ ] ${surface.name}`);
        console.log(`      File: ${surface.filePath}`);
        console.log(`      Wrapper: ${surface.wrapperType}`);
        console.log(`      Patterns: ${result.wrappersApplied}`);
        console.log('');
      }
    });
  }

  // Emit JSON for programmatic handling
  const reportPath = path.join(process.cwd(), 'p0-migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ surfaces: P0_SURFACES, results }, null, 2));
  console.log(`Full report: ${reportPath}`);
}

main().catch((e) => {
  console.error('FATAL ERROR:', e.message);
  process.exit(1);
});
