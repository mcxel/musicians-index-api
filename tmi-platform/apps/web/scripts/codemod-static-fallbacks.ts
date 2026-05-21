#!/usr/bin/env tsx

/**
 * scripts/codemod-static-fallbacks.ts
 *
 * Automated codemod to convert static image rendering to governed patterns.
 *
 * STRATEGY:
 * 1. Find all direct image patterns: <img src=, backgroundImage: `url(, <video src=
 * 2. Replace with appropriate wrapper component
 * 3. Generate unique imageId for each slot
 * 4. Route through ImageSlotWrapper or PerformerPortraitWrapper
 * 5. Add governance telemetry
 *
 * EXECUTION:
 *   pnpm exec tsx scripts/codemod-static-fallbacks.ts
 */

import fs from 'fs';
import path from 'path';
// Use require to avoid ambient type dependency for script-only tooling.
const { sync: globSync } = require('glob');

interface CodemodStats {
  filesProcessed: number;
  replacementsApplied: number;
  imgTagsFound: number;
  backgroundImageFound: number;
  videoTagsFound: number;
  errorCount: number;
  filesModified: string[];
}

const stats: CodemodStats = {
  filesProcessed: 0,
  replacementsApplied: 0,
  imgTagsFound: 0,
  backgroundImageFound: 0,
  videoTagsFound: 0,
  errorCount: 0,
  filesModified: [],
};

/**
 * Pattern 1: Direct <img src="..."/> to ImageSlotWrapper
 */
function codemodImgTags(content: string, filePath: string): { modified: string; count: number } {
  let modified = content;
  let count = 0;

  // Pattern: <img src="..." or {imageUrl && <img src={imageUrl}}
  const imgPattern = /<img\s+([^>]*?)src=["']?{?([^}"']+)}?["']?([^>]*?)\/?\s*>/gs;

  let match;
  while ((match = imgPattern.exec(content)) !== null) {
    stats.imgTagsFound++;
    const beforeAttrs = match[1];
    const srcValue = match[2];
    const afterAttrs = match[3];

    // Skip if already wrapped
    if (content.includes('ImageSlotWrapper') && content.includes(srcValue)) {
      continue;
    }

    const slotId = `img-${Math.random().toString(36).substring(7)}`;
    const className = beforeAttrs.match(/className=["']([^"']+)["']/)?.[1] || 'w-full h-full object-cover';
    const alt = beforeAttrs.match(/alt=["']([^"']+)["']/)?.[1] || 'Content image';

    const replacement = `<ImageSlotWrapper imageId="${slotId}" roomId={roomId} priority="normal" className="${className}" altText="${alt}" containerStyle={{ width: '100%', height: '100%' }} />`;

    modified = modified.replace(match[0], replacement);
    count++;
  }

  return { modified, count };
}

/**
 * Pattern 2: backgroundImage: `url('...')` to govern through CSS or wrapper
 */
function codemodBackgroundImage(content: string, filePath: string): { modified: string; count: number } {
  let modified = content;
  let count = 0;

  // Pattern: backgroundImage: `url('...')` or backgroundImage: `url("...")`
  const bgPattern = /backgroundImage:\s*`url\(['"]([^'"]+)['"]`\)`/gs;

  let match;
  while ((match = bgPattern.exec(content)) !== null) {
    stats.backgroundImageFound++;
    const imageUrl = match[1];

    // Skip if already wrapped
    if (content.includes('GovernedMonitorSlot') || content.includes('ImageSlotWrapper')) {
      continue;
    }

    // For background images, replace with a data attribute that can be picked up by wrapper
    const replacement = `data-governed-image="${imageUrl}"`;
    modified = modified.replace(match[0], replacement);
    count++;
  }

  return { modified, count };
}

/**
 * Pattern 3: Direct video src to governance
 */
function codemodVideoTags(content: string, filePath: string): { modified: string; count: number } {
  let modified = content;
  let count = 0;

  const videoPattern = /<video\s+([^>]*?)src=["']?([^}"']+)["']?([^>]*?)>/gs;

  let match;
  while ((match = videoPattern.exec(content)) !== null) {
    stats.videoTagsFound++;
    const srcValue = match[2];

    // Skip if already wrapped
    if (content.includes('VideoSlotWrapper')) {
      continue;
    }

    // For now, add a comment indicating this needs manual review
    const replacement = `{/* GOVERNED: video slot requires manual MotionPortraitWrapper setup */}\n      <video src="${srcValue}"></video>`;
    modified = modified.replace(match[0], replacement);
    count++;
  }

  return { modified, count };
}

/**
 * Apply all codemods to a file
 */
async function processFile(filePath: string): Promise<void> {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Apply Pattern 1: img tags
    const imgResult = codemodImgTags(content, filePath);
    if (imgResult.count > 0) {
      content = imgResult.modified;
      stats.replacementsApplied += imgResult.count;
      modified = true;
    }

    // Apply Pattern 2: background images
    const bgResult = codemodBackgroundImage(content, filePath);
    if (bgResult.count > 0) {
      content = bgResult.modified;
      stats.replacementsApplied += bgResult.count;
      modified = true;
    }

    // Apply Pattern 3: video tags
    const videoResult = codemodVideoTags(content, filePath);
    if (videoResult.count > 0) {
      content = videoResult.modified;
      stats.replacementsApplied += videoResult.count;
      modified = true;
    }

    // Write back if modified
    if (modified) {
      // Add import statement if not present
      if (!content.includes('import { ImageSlotWrapper }')) {
        content =
          "import { ImageSlotWrapper } from '@/components/visual-enforcement';\n" + content;
      }

      fs.writeFileSync(filePath, content, 'utf-8');
      stats.filesModified.push(filePath);
    }
  } catch (e: any) {
    console.error(`ERROR processing ${filePath}: ${e.message}`);
    stats.errorCount++;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(
    `
=== STATIC FALLBACK CODEMOD ===
Scanning for direct image rendering patterns...
  `
  );


  // Find all TSX/TS files using sync glob
  const files = globSync('src/**/*.{tsx,ts,jsx,js}', {
    ignore: ['node_modules/**', 'dist/**', '.next/**'],
    cwd: process.cwd(),
  });
  console.log(`Found ${files.length} files to scan`);

  // Process each file
  for (const file of files) {
    stats.filesProcessed++;
    await processFile(file);
  }

  // Report results
  console.log(`
=== CODEMOD RESULTS ===
Files processed: ${stats.filesProcessed}
Files modified: ${stats.filesModified.length}
Total replacements applied: ${stats.replacementsApplied}

Patterns found:
  <img> tags: ${stats.imgTagsFound}
  backgroundImage patterns: ${stats.backgroundImageFound}
  <video> tags: ${stats.videoTagsFound}

Errors: ${stats.errorCount}

Modified files:
${stats.filesModified.map((f) => `  - ${f}`).join('\n')}
  `);

  if (stats.replacementsApplied === 0) {
    console.log('✓ No replacements needed - all surfaces are already governed!');
    process.exit(0);
  } else {
    console.log(`✓ Applied ${stats.replacementsApplied} governance transformations`);
    console.log(
      '\nNext steps:'
    );
    console.log('1. Review modified files for correctness');
    console.log('2. Update roomId prop context for ImageSlotWrapper calls');
    console.log('3. Run TypeScript validation: pnpm exec tsc --noEmit');
    console.log('4. Re-run scan-static-fallbacks to verify conversion');
    process.exit(0);
  }
}

main().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
