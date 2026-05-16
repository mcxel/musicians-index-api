/**
 * src/lib/vision/scan-no-static-bypass.ts
 *
 * Static proof gate: scans all component/package files for visual bypass patterns
 * that skip the authority-enforcement wrapper layer.
 *
 * Detects:
 *   1. Raw <img or <motion.img that render images without authority (outside ImageSlotWrapper)
 *   2. CSS backgroundImage with hardcoded url() strings
 *   3. 'use client' directive placed after an import statement
 *
 * Run via:  npx tsx src/lib/vision/scan-no-static-bypass.ts
 *
 * Exit codes:
 *   0 = clean
 *   1 = one or more violations found
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// __dirname = .../apps/web/src/lib/vision
const SRC_ROOT = path.resolve(__dirname, '../..');

const SCAN_DIRS = [
  path.join(SRC_ROOT, 'components'),
  path.join(SRC_ROOT, 'packages'),
];

// Files/dirs that are explicitly exempt from static-bypass checks
const EXEMPT_FILES = new Set([
  // ── Terminal renderer — the authority endpoint itself ──────────────────────
  'visual-enforcement/ImageSlotWrapper.tsx',
  // ── Orbit animation layer — framer cutout mode, documented ────────────────
  'home/OrbitBattleAnimationLayer.tsx',
  // ── Decorative hero background at 0.12 opacity — documented ───────────────
  'home/Home1MagazineCoverHero.tsx',
  // ── GovernedMonitorSlot degraded fallback — intentional ───────────────────
  'monitors/GovernedMonitorSlot.tsx',
  // ── Admin video observatory walls — live camera feed placeholders ──────────
  // CSS backgroundImage here is the placeholder canvas for a video stream,
  // not a static user image bypass. Admin-only, not user-facing.
  'admin/AdminVideoObservatoryWall.tsx',
  'admin/EventObservatoryWall.tsx',
  'admin/VenueMultiCamWall.tsx',
  // ── Admin multiview — live camera URLs in profileMultiView ────────────────
  'admin/ProfileMultiViewWindow.tsx',
  // ── SVG data URI texture — decorative pattern, not a photo ───────────────
  'editorial/EditorialMagazineShell.tsx',
  // ── Curated TMI composition layer — static branded asset ─────────────────
  'home/Home1MagazineCoverComposition.tsx',
  // ── Investor preview surface — not user-facing runtime ────────────────────
  'investor/InvestorPreviewSurface.tsx',
]);

// Extensions to scan
const SCAN_EXTS = new Set(['.tsx', '.jsx']);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Violation {
  file: string;
  line: number;
  kind: 'raw-img' | 'motion-img' | 'css-background-url' | 'client-directive-order';
  snippet: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relPath(abs: string): string {
  // Return path relative to SRC_ROOT for display
  return abs.replace(SRC_ROOT + path.sep, '').replace(/\\/g, '/');
}

function isExempt(abs: string): boolean {
  const rel = relPath(abs);
  for (const exempt of EXEMPT_FILES) {
    if (rel.endsWith(exempt)) return true;
  }
  return false;
}

function collectFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  try {
    const output = execSync(
      `node -e "const fs=require('fs'),path=require('path');function walk(d){const e=fs.readdirSync(d,{withFileTypes:true});let r=[];for(const f of e){const fp=path.join(d,f.name);if(f.isDirectory()&&!f.name.startsWith('.')){r=r.concat(walk(fp));}else if(['.tsx','.jsx'].includes(path.extname(f.name))){r.push(fp);}}return r;}console.log(JSON.stringify(walk(process.argv[1])));" "${dir}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return JSON.parse(output.trim()) as string[];
  } catch {
    // Fallback: manual walk
    return walkSync(dir);
  }
}

function walkSync(dir: string): string[] {
  const result: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      result.push(...walkSync(fullPath));
    } else if (SCAN_EXTS.has(path.extname(entry.name))) {
      result.push(fullPath);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Checkers
// ---------------------------------------------------------------------------

/**
 * Detects raw <img or <motion.img that are NOT inside ImageSlotWrapper.tsx itself.
 * We look for the JSX pattern <img\s or motion\.img\s in component return values.
 */
function checkRawImgTags(file: string, lines: string[]): Violation[] {
  const violations: Violation[] = [];
  const rawImgPattern = /<img\s/;
  const motionImgPattern = /motion\.img|<motion\.img/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (rawImgPattern.test(line)) {
      violations.push({ file, line: i + 1, kind: 'raw-img', snippet: line.trim().slice(0, 100) });
    } else if (motionImgPattern.test(line)) {
      violations.push({ file, line: i + 1, kind: 'motion-img', snippet: line.trim().slice(0, 100) });
    }
  }
  return violations;
}

/**
 * Detects CSS backgroundImage with hardcoded url() strings.
 * Pattern: backgroundImage: `url('${...}')` or backgroundImage: "url(...)"
 * We flag only those with literal url( strings (not CSS variables).
 */
function checkCssBackgroundUrl(file: string, lines: string[]): Violation[] {
  const violations: Violation[] = [];
  // Match: backgroundImage: ...url( (any quote style)
  const pattern = /backgroundImage\s*:\s*[`"'].*url\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      violations.push({ file, line: i + 1, kind: 'css-background-url', snippet: lines[i].trim().slice(0, 100) });
    }
  }
  return violations;
}

/**
 * Detects 'use client' directive placed after any import statement.
 * Only flags files that actually CONTAIN the directive but have it after an import.
 * Server components (no directive) are valid and not flagged.
 */
function checkClientDirectiveOrder(file: string, src: string): Violation[] {
  const hasDirective = /'use client'|"use client"/.test(src);
  if (!hasDirective) return []; // server component — fine

  // Strip leading block comments
  const stripped = src.replace(/^\/\*[\s\S]*?\*\/\s*/m, '').trimStart();
  const lines = stripped.split('\n');

  // Find first non-comment, non-blank line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) continue;

    const isClientDirective = line === "'use client';" || line === '"use client";';
    if (isClientDirective) break; // OK — directive is first

    if (line.startsWith('import ') || line.startsWith('import{') || line.startsWith('import*')) {
      return [{
        file,
        line: i + 1,
        kind: 'client-directive-order',
        snippet: `'use client' exists but first statement is: ${line.slice(0, 80)}`,
      }];
    }
    break; // Something else first — not a client-directive violation
  }
  return [];
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function runScan(): void {
  const allFiles: string[] = [];
  for (const dir of SCAN_DIRS) {
    allFiles.push(...collectFiles(dir));
  }

  const scanned = allFiles.filter((f) => !isExempt(f));
  const allViolations: Violation[] = [];

  for (const file of scanned) {
    const src = fs.readFileSync(file, 'utf-8');
    const lines = src.split('\n');
    const rel = relPath(file);

    const rawImg = checkRawImgTags(rel, lines);
    const cssUrl = checkCssBackgroundUrl(rel, lines);
    const clientOrder = checkClientDirectiveOrder(rel, src);

    allViolations.push(...rawImg, ...cssUrl, ...clientOrder);
  }

  // ---------------------------------------------------------------------------
  // Report
  // ---------------------------------------------------------------------------

  console.log('\n════════════════════════════════════════════════════════');
  console.log('  NO-STATIC-BYPASS PROOF GATE');
  console.log('════════════════════════════════════════════════════════\n');
  console.log(`  Scanned: ${scanned.length} files`);
  console.log(`  Exempt:  ${allFiles.length - scanned.length} files (documented exceptions)\n`);

  if (allViolations.length === 0) {
    console.log('  ✓ No static bypass violations detected');
    console.log('\n  VERDICT: CLEAN\n');
    process.exit(0);
  }

  // Group by kind
  const byKind = new Map<string, Violation[]>();
  for (const v of allViolations) {
    const list = byKind.get(v.kind) ?? [];
    list.push(v);
    byKind.set(v.kind, list);
  }

  const KIND_LABEL: Record<string, string> = {
    'raw-img': 'RAW <img> TAGS',
    'motion-img': 'MOTION.IMG (framer) BYPASSES',
    'css-background-url': 'CSS backgroundImage url() BYPASSES',
    'client-directive-order': "'use client' AFTER IMPORT",
  };

  for (const [kind, violations] of byKind) {
    console.log(`  ── ${KIND_LABEL[kind] ?? kind} (${violations.length}) ──`);
    for (const v of violations) {
      console.log(`  ✗  ${v.file}:${v.line}`);
      console.log(`     ${v.snippet}`);
    }
    console.log('');
  }

  console.log('────────────────────────────────────────────────────────');
  console.log(`  TOTAL VIOLATIONS: ${allViolations.length}`);
  console.log('\n  To suppress a known/intentional bypass, add the file\'s');
  console.log('  relative path to EXEMPT_FILES in this script.\n');
  console.log('  VERDICT: VIOLATIONS FOUND — investigate before deploy\n');
  process.exit(1);
}

runScan();
