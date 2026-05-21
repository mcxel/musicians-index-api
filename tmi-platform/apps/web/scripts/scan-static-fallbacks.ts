import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const includeExt = new Set(['.ts', '.tsx', '.js', '.jsx']);
const violations: Array<{ file: string; reason: string }> = [];

const bypassPatterns = [
  /<img\s+[^>]*src=\{/g,
  /backgroundImage\s*:\s*`?\s*url\(/g,
  /<video\s+[^>]*src=\{/g,
];

const wrapperSignals = [
  /<\s*ImageSlotWrapper\b/g,
  /<\s*MagazineSlotWrapper\b/g,
  /<\s*PerformerPortraitWrapper\b/g,
  /<\s*VenueReconstructionWrapper\b/g,
  /<\s*VisualAuthorityGateway\b/g,
  /<\s*GovernedMonitorSlot\b/g,
  /<\s*GovernedOrbitFace\b/g,
];

const authorityHookSignals = [
  /useVisualRouting\s*\(/g,
  /useVisualAuthority\s*\(/g,
  /useImageSlot\s*\(/g,
  /useMagazineSlot\s*\(/g,
  /usePerformerPortrait\s*\(/g,
  /useVenueReconstruction\s*\(/g,
];

const governanceLifecycleSignals = [
  /visual_authority_applied/g,
  /lineage_registered/g,
  /generator_wrapped/g,
  /static_bypass_removed/g,
  /lineage/g,
  /telemetry/g,
  /quarantine/g,
  /recovery/g,
  /degraded/g,
  /fallback/g,
  /overlay/g,
  /arbitrat/g,
];

function countMatches(text: string, patterns: RegExp[]): number {
  let count = 0;
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) count += 1;
  }
  return count;
}

function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');
}

function hasBypassPattern(text: string): boolean {
  return countMatches(text, bypassPatterns) > 0;
}

function governanceAssessment(text: string): { governed: boolean; reason: string } {
  const wrapperCount = countMatches(text, wrapperSignals);
  const hookCount = countMatches(text, authorityHookSignals);
  const lifecycleCount = countMatches(text, governanceLifecycleSignals);

  // Governance authenticity rule:
  // - wrapper composition OR authority hook usage is authoritative
  // - otherwise lifecycle-only hints are not sufficient
  const hasAuthorityRouting = wrapperCount > 0 || hookCount > 0;
  const hasLifecycleObservability = lifecycleCount > 0;

  if (hasAuthorityRouting) {
    return {
      governed: true,
      reason: `governed (wrappers=${wrapperCount}, hooks=${hookCount}, lifecycle=${lifecycleCount})`,
    };
  }

  return {
    governed: false,
    reason: `ungoverned (wrappers=${wrapperCount}, hooks=${hookCount}, lifecycle=${lifecycleCount})`,
  };
}

function walk(dir: string): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(full);
      continue;
    }
    if (!includeExt.has(path.extname(entry.name))) continue;

    const rawText = fs.readFileSync(full, 'utf8');
    const text = stripComments(rawText);
    if (!hasBypassPattern(text)) {
      continue;
    }

    const assessment = governanceAssessment(text);
    if (!assessment.governed) {
      violations.push({
        file: path.relative(process.cwd(), full),
        reason: assessment.reason,
      });
    }
  }
}

walk(root);

if (violations.length > 0) {
  console.error('FAIL: ungoverned static fallback surfaces detected');
  for (const entry of violations.slice(0, 200)) {
    console.error(`  - ${entry.file} :: ${entry.reason}`);
  }
  process.exit(1);
}

console.log('PASS: all static fallback patterns are backed by runtime governance signals');
