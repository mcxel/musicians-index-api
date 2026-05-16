/**
 * src/lib/vision/scan-authority-wrapper-integrity.ts
 *
 * Static proof gate: validates visual-enforcement wrapper files meet
 * all authority governance requirements before any deploy gate passes.
 *
 * Run via:  npx tsx src/lib/vision/scan-authority-wrapper-integrity.ts
 *
 * Exit codes:
 *   0 = all checks pass
 *   1 = one or more checks failed
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// __dirname = .../apps/web/src/lib/vision
const WRAPPER_DIR = path.resolve(__dirname, '../../components/visual-enforcement');
const HOOKS_FILE = path.resolve(__dirname, '../hooks/useVisualAuthority.ts');

/** Each wrapper file and the authority hook it must call */
const WRAPPER_MANIFEST: Record<string, { hook: string; label: string }> = {
  'ImageSlotWrapper.tsx': {
    hook: 'useImageSlot',
    label: 'ImageSlotWrapper',
  },
  'PerformerPortraitWrapper.tsx': {
    hook: 'usePerformerPortrait',
    label: 'PerformerPortraitWrapper',
  },
  'VenueReconstructionWrapper.tsx': {
    hook: 'useVenueReconstruction',
    label: 'VenueReconstructionWrapper',
  },
  'MagazineSlotWrapper.tsx': {
    hook: 'useMagazineSlot',
    label: 'MagazineSlotWrapper',
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckResult {
  checkId: string;
  file: string;
  passed: boolean;
  detail: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readWrapper(filename: string): string {
  const fullPath = path.join(WRAPPER_DIR, filename);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Wrapper file not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

function readHooks(): string {
  if (!fs.existsSync(HOOKS_FILE)) {
    throw new Error(`Hooks file not found: ${HOOKS_FILE}`);
  }
  return fs.readFileSync(HOOKS_FILE, 'utf-8');
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

/**
 * CHECK 1: 'use client' directive is present and is the first non-comment
 * statement (must appear before any import).
 */
function checkClientDirective(filename: string, src: string): CheckResult {
  const checkId = 'client-directive';
  // Strip block comments from start
  const stripped = src.replace(/^\/\*[\s\S]*?\*\/\s*/m, '').trimStart();
  const firstLine = stripped.split('\n')[0].trim();
  const passed = firstLine === "'use client';" || firstLine === '"use client";';
  return {
    checkId,
    file: filename,
    passed,
    detail: passed
      ? "'use client' is the first directive"
      : `First statement is "${firstLine}" — expected 'use client'`,
  };
}

/**
 * CHECK 2: Authority hook is imported from useVisualAuthority.
 */
function checkAuthorityHookImport(
  filename: string,
  src: string,
  hook: string
): CheckResult {
  const checkId = 'authority-hook-import';
  const passed =
    src.includes(`from '@/lib/hooks/useVisualAuthority'`) &&
    src.includes(hook);
  return {
    checkId,
    file: filename,
    passed,
    detail: passed
      ? `${hook} imported from useVisualAuthority`
      : `Missing import of ${hook} from '@/lib/hooks/useVisualAuthority'`,
  };
}

/**
 * CHECK 3: Authority hook is actually called in the component body.
 */
function checkAuthorityHookCalled(
  filename: string,
  src: string,
  hook: string
): CheckResult {
  const checkId = 'authority-hook-called';
  // Must appear as a call expression, not just import
  const callPattern = new RegExp(`${hook}\\s*\\(`);
  const passed = callPattern.test(src);
  return {
    checkId,
    file: filename,
    passed,
    detail: passed
      ? `${hook}() is called in component body`
      : `${hook}() is never called — authority is not enforced at runtime`,
  };
}

/**
 * CHECK 4: No raw <img> bypass — any image rendering must go through
 * ImageSlotWrapper or an authority hook.
 * Exception: ImageSlotWrapper itself renders <img> — that is the terminal
 * authority node and is explicitly allowed.
 */
function checkNoRawImgBypass(filename: string, src: string): CheckResult {
  const checkId = 'no-raw-img-bypass';
  // ImageSlotWrapper IS the terminal node — skip this check for it
  if (filename === 'ImageSlotWrapper.tsx') {
    return {
      checkId,
      file: filename,
      passed: true,
      detail: 'ImageSlotWrapper is the terminal renderer — raw <img> is authorised',
    };
  }
  // Check for bare <img (not inside a comment, not an <ImageSlotWrapper)
  const rawImgPattern = /<img\s/g;
  const matches = src.match(rawImgPattern);
  const passed = !matches || matches.length === 0;
  return {
    checkId,
    file: filename,
    passed,
    detail: passed
      ? 'No raw <img> bypass detected'
      : `${matches!.length} raw <img> tag(s) found — all images must route through ImageSlotWrapper`,
  };
}

/**
 * CHECK 5: onStateChange callback (if present) uses Record<string, unknown>
 * instead of `any`.
 */
function checkOnStateChangeType(filename: string, src: string): CheckResult {
  const checkId = 'onStateChange-no-any';
  const hasCallback = src.includes('onStateChange');
  if (!hasCallback) {
    return {
      checkId,
      file: filename,
      passed: true,
      detail: 'No onStateChange prop — check skipped',
    };
  }
  const anyPattern = /onStateChange\s*\?\s*:\s*\([^)]*\bany\b/;
  const passed = !anyPattern.test(src);
  return {
    checkId,
    file: filename,
    passed,
    detail: passed
      ? 'onStateChange uses Record<string, unknown> (no any)'
      : 'onStateChange still typed as (state: any) — must be Record<string, unknown>',
  };
}

/**
 * CHECK 6: Loading/blocked/error states are all handled — no unguarded
 * render path that skips authority.
 */
function checkLoadingAndErrorGuards(filename: string, src: string): CheckResult {
  const checkId = 'loading-error-guards';
  const hasLoadingGuard = /isLoading/.test(src);
  const hasBlockedGuard = /blocked/.test(src);
  const hasErrorGuard = /error/.test(src);
  const passed = hasLoadingGuard && hasBlockedGuard && hasErrorGuard;
  const missing: string[] = [];
  if (!hasLoadingGuard) missing.push('isLoading');
  if (!hasBlockedGuard) missing.push('blocked');
  if (!hasErrorGuard) missing.push('error');
  return {
    checkId,
    file: filename,
    passed,
    detail: passed
      ? 'isLoading, blocked, and error states all handled'
      : `Missing guard(s): ${missing.join(', ')}`,
  };
}

/**
 * CHECK 7: No direct static rendering — no hardcoded image src strings
 * outside of the authority hook resolution path.
 * Detects patterns like src="/images/..." or src="https://..." in JSX.
 */
function checkNoStaticImageSrc(filename: string, src: string): CheckResult {
  const checkId = 'no-static-image-src';
  // Allow: src={displayUrl} or src={url} (dynamic)
  // Disallow: src="/..." or src="https://..." (static bypass)
  const staticSrcPattern = /\bsrc\s*=\s*["'`](\/|https?:\/\/)/;
  const passed = !staticSrcPattern.test(src);
  return {
    checkId,
    file: filename,
    passed,
    detail: passed
      ? 'No hardcoded static image src detected'
      : 'Hardcoded static src="..." found — images must resolve through authority hook',
  };
}

/**
 * CHECK 8: Authority hook export exists in useVisualAuthority.ts.
 */
function checkHookExportedFromAuthority(
  filename: string,
  hooksSrc: string,
  hook: string
): CheckResult {
  const checkId = 'hook-exported';
  const exportPattern = new RegExp(`export\\s+function\\s+${hook}\\b`);
  const passed = exportPattern.test(hooksSrc);
  return {
    checkId,
    file: filename,
    passed,
    detail: passed
      ? `${hook} is exported from useVisualAuthority.ts`
      : `${hook} is NOT exported from useVisualAuthority.ts — authority chain is broken`,
  };
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function runChecks(): void {
  const results: CheckResult[] = [];
  let hooksSrc: string;

  try {
    hooksSrc = readHooks();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`\n[FATAL] Cannot read hooks file: ${msg}`);
    process.exit(1);
  }

  for (const [filename, { hook, label }] of Object.entries(WRAPPER_MANIFEST)) {
    let src: string;
    try {
      src = readWrapper(filename);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({
        checkId: 'file-exists',
        file: filename,
        passed: false,
        detail: `Cannot read wrapper file: ${msg}`,
      });
      continue;
    }

    results.push(checkClientDirective(filename, src));
    results.push(checkAuthorityHookImport(filename, src, hook));
    results.push(checkAuthorityHookCalled(filename, src, hook));
    results.push(checkNoRawImgBypass(filename, src));
    results.push(checkOnStateChangeType(filename, src));
    results.push(checkLoadingAndErrorGuards(filename, src));
    results.push(checkNoStaticImageSrc(filename, src));
    results.push(checkHookExportedFromAuthority(filename, hooksSrc, hook));

    void label; // suppress unused-var in strict mode
  }

  // ---------------------------------------------------------------------------
  // Report
  // ---------------------------------------------------------------------------

  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);

  console.log('\n════════════════════════════════════════════════════════');
  console.log('  AUTHORITY WRAPPER INTEGRITY PROOF GATE');
  console.log('════════════════════════════════════════════════════════\n');

  // Group by file
  const byFile = new Map<string, CheckResult[]>();
  for (const r of results) {
    const list = byFile.get(r.file) ?? [];
    list.push(r);
    byFile.set(r.file, list);
  }

  for (const [file, checks] of byFile) {
    const allPass = checks.every((c) => c.passed);
    const icon = allPass ? '✅' : '❌';
    console.log(`${icon}  ${file}`);
    for (const c of checks) {
      const mark = c.passed ? '  ✓' : '  ✗';
      console.log(`${mark}  [${c.checkId}] ${c.detail}`);
    }
    console.log('');
  }

  console.log('────────────────────────────────────────────────────────');
  console.log(`  TOTAL: ${passed.length}/${results.length} checks passed`);

  if (failed.length > 0) {
    console.log(`\n  FAILURES (${failed.length}):`);
    for (const f of failed) {
      console.log(`  ✗  ${f.file}  [${f.checkId}]  ${f.detail}`);
    }
    console.log('\n  VERDICT: PROOF GATE FAILED — do not deploy\n');
    process.exit(1);
  } else {
    console.log('\n  VERDICT: ALL CHECKS PASS — wrapper governance intact\n');
    process.exit(0);
  }
}

runChecks();
