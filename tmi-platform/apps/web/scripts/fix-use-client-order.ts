/**
 * scripts/fix-use-client-order.ts
 *
 * Repairs the codemod corruption where
 *   import { ImageSlotWrapper } from '@/components/visual-enforcement';
 * was injected as line 1 before 'use client' in client components.
 *
 * Strategy per file:
 *   - If the stray import appears at line 1 AND the file has 'use client' later,
 *     remove line 1 (the proper import already exists elsewhere in most files, or
 *     the component does not actually use ImageSlotWrapper there).
 *   - After removal, if ImageSlotWrapper is referenced in the file but no longer
 *     has an import, insert it after 'use client'.
 *
 * Run via:  npx tsx scripts/fix-use-client-order.ts
 */

import fs from 'fs';
import path from 'path';

const SRC_ROOT = path.resolve(__dirname, '../src');
const SCAN_DIRS = [
  path.join(SRC_ROOT, 'components'),
  path.join(SRC_ROOT, 'packages'),
];

const STRAY_IMPORT = `import { ImageSlotWrapper } from '@/components/visual-enforcement';`;
const STRAY_IMPORT_ALT = `import { ImageSlotWrapper } from "@/components/visual-enforcement";`;
const PROPER_IMPORT = `import { ImageSlotWrapper } from '@/components/visual-enforcement/ImageSlotWrapper';`;

function walkSync(dir: string, exts: Set<string>): string[] {
  const result: string[] = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      result.push(...walkSync(full, exts));
    } else if (exts.has(path.extname(entry.name))) {
      result.push(full);
    }
  }
  return result;
}

function isStrayLine(line: string): boolean {
  return line.trim() === STRAY_IMPORT || line.trim() === STRAY_IMPORT_ALT;
}

function hasClientDirective(src: string): boolean {
  return /'use client'|"use client"/.test(src);
}

function hasImageSlotWrapperUsage(src: string): boolean {
  // Check if ImageSlotWrapper is referenced (not counting the import itself)
  return (src.match(/ImageSlotWrapper/g) ?? []).length > 1;
}

function hasProperImport(src: string): boolean {
  // Has a non-stray import for ImageSlotWrapper after 'use client'
  const lines = src.split('\n');
  let pastDirective = false;
  for (const line of lines) {
    if (!pastDirective && (line.trim() === "'use client';" || line.trim() === '"use client";')) {
      pastDirective = true;
      continue;
    }
    if (pastDirective && line.includes('ImageSlotWrapper') && line.startsWith('import')) {
      return true;
    }
  }
  return false;
}

function insertImportAfterDirective(src: string): string {
  const lines = src.split('\n');
  let inserted = false;
  const result: string[] = [];
  for (const line of lines) {
    result.push(line);
    if (!inserted && (line.trim() === "'use client';" || line.trim() === '"use client";')) {
      result.push('');
      result.push(PROPER_IMPORT);
      inserted = true;
    }
  }
  return result.join('\n');
}

function fixFile(filepath: string): 'fixed' | 'skipped' | 'no-change' {
  const src = fs.readFileSync(filepath, 'utf-8');
  const lines = src.split('\n');

  // Only operate on files where line 0 is the stray import
  if (!isStrayLine(lines[0])) return 'no-change';
  if (!hasClientDirective(src)) return 'no-change';

  // Remove stray line 0
  const withoutStray = lines.slice(1).join('\n');

  // If ImageSlotWrapper is used but has no proper import after directive, add one
  const usesWrapper = hasImageSlotWrapperUsage(withoutStray);
  const alreadyImported = hasProperImport(withoutStray);

  const fixed = usesWrapper && !alreadyImported
    ? insertImportAfterDirective(withoutStray)
    : withoutStray;

  if (fixed === src) return 'no-change';

  fs.writeFileSync(filepath, fixed, 'utf-8');
  return 'fixed';
}

function run() {
  const files: string[] = [];
  for (const dir of SCAN_DIRS) {
    files.push(...walkSync(dir, new Set(['.tsx', '.jsx', '.ts', '.js'])));
  }

  let fixed = 0;
  let skipped = 0;
  let noChange = 0;

  for (const file of files) {
    const result = fixFile(file);
    if (result === 'fixed') {
      const rel = file.replace(SRC_ROOT + path.sep, '').replace(/\\/g, '/');
      console.log(`  ✓  Fixed: ${rel}`);
      fixed++;
    } else if (result === 'skipped') {
      skipped++;
    } else {
      noChange++;
    }
  }

  console.log('\n────────────────────────────────────────────────────────');
  console.log(`  Fixed:     ${fixed}`);
  console.log(`  No-change: ${noChange}`);
  console.log(`  Skipped:   ${skipped}`);

  if (fixed === 0) {
    console.log('\n  No stray imports found — codebase is clean.\n');
  } else {
    console.log(`\n  Repaired ${fixed} file(s). Re-run the bypass scan to verify.\n`);
  }
}

run();
