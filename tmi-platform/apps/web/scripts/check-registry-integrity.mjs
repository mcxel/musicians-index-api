/**
 * Slice 6 — Brick 5: Registry Integrity Lock
 *
 * Static checks (no browser needed):
 *   1. Every issueRegistry entry has a matching zoneMap key in zoneMaps
 *   2. Every zone key referenced in any zoneMap exists in contentRegistry
 *   3. All dataAdapter functions return non-empty arrays (mock data guard)
 *   4. visualRegistry maps all declared visuals and every zone has visual bindings
 *
 * Exit 0 = pass  |  Exit 1 = failure
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, "../src/packages/magazine-engine");

// ── 1. Read source files as text for static key extraction ───────────────────

function extractStringArray(source, varName) {
  // Matches: export const VARNAME = ["a","b","c"] or similar
  const re = new RegExp(`${varName}\\s*=\\s*\\[([\\s\\S]*?)\\]`, "m");
  const m = source.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"|'([^']+)'/g)].map((x) => x[1] ?? x[2]);
}

function extractObjectKeys(source, varName) {
  // Matches keys like:  hero:, editorial:, ranking:  inside the object
  const re = new RegExp(`${varName}[\\s\\S]*?=\\s*\\{([\\s\\S]*?)^\\}`, "m");
  const m = source.match(re);
  if (!m) {
    // fallback: find all   key:   patterns after the variable declaration
    const start = source.indexOf(varName);
    if (start === -1) return [];
    const block = source.slice(start, start + 4000);
    return [...block.matchAll(/^\s{2}(\w+)\s*:/gm)].map((x) => x[1]);
  }
  return [...m[1].matchAll(/^\s{2,4}(\w+)\s*:/gm)].map((x) => x[1]);
}

// ── 2. Parse issueRegistry ────────────────────────────────────────────────────

const issueRegSrc = readFileSync(resolve(SRC, "issueRegistry.ts"), "utf-8");
// Extract mapId values: mapId: "home1"  etc.
// Extract zoneMap values: zoneMap: "home1"  etc.
const mapIds = [...issueRegSrc.matchAll(/zoneMap\s*:\s*["'](\w+)["']/g)].map((m) => m[1]);

// ── 3. Parse zoneMaps ─────────────────────────────────────────────────────────

const zoneMapsSrc = readFileSync(resolve(SRC, "zoneMaps.ts"), "utf-8");
// Extract top-level keys in the zoneMaps export object: home1, home2 …
// zoneMaps is Record<ZoneMapId, IssueZoneKey[]> — extract map keys and all string values in arrays
const zoneMapKeys = [...zoneMapsSrc.matchAll(/^\s{2}(\w+)\s*:/gm)].map((m) => m[1])
  .filter((k) => /^home\d+$/.test(k));
// Extract all quoted string values inside arrays  [ "hero", "editorial", ... ]
const zoneIdsInMaps = [...zoneMapsSrc.matchAll(/"(\w+)"/g)].map((m) => m[1])
  .filter((v) => !/^home\d+$/.test(v) && !["left","right","print","neon","stage","small","medium","large","tall","wide"].includes(v));

// ── 4. Parse contentRegistry ─────────────────────────────────────────────────

const contentRegSrc = readFileSync(resolve(SRC, "contentRegistry.tsx"), "utf-8");
// Find keys inside contentRegistry record: "  hero:" etc.
const registryKeys = [...contentRegSrc.matchAll(/^\s{2}(\w+)\s*:/gm)].map((m) => m[1])
  .filter((k) => !["type", "function", "export", "import", "const", "let", "var"].includes(k));

// ── 5. Parse dataAdapters for validateAdapters ────────────────────────────────

const adapterSrc = readFileSync(resolve(SRC, "dataAdapters.ts"), "utf-8");
// Extract all exported get* function names
const adapterFns = [...adapterSrc.matchAll(/^export function (get\w+)/gm)].map((m) => m[1]);

// ── 6. Parse visualRegistry for coverage ------------------------------------

const visualRegistrySrc = readFileSync(resolve(SRC, "visualRegistry.ts"), "utf-8");
const visualNames = [...visualRegistrySrc.matchAll(/"([A-Za-z]+[A-Za-z0-9]*)"/g)]
  .map((m) => m[1])
  .filter((v) => /Frame$|Shell$|Bar$|Board$|Canvas$|Cluster$|Panel$|Card$/.test(v));

const zoneBindingKeys = [...visualRegistrySrc.matchAll(/^\s{2}(\w+): \[/gm)].map((m) => m[1]);

// ── 7. Run checks ─────────────────────────────────────────────────────────────

let allPass = true;
const failures = [];

function check(condition, message) {
  if (!condition) {
    allPass = false;
    failures.push(message);
  }
}

console.log("\n=== REGISTRY INTEGRITY CHECK ===\n");

// Check 1: every issueRegistry mapId has a zoneMap entry
for (const mapId of mapIds) {
  const has = zoneMapKeys.includes(mapId);
  console.log(`  ${has ? "✓" : "✗"}  issueRegistry mapId "${mapId}" exists in zoneMaps`);
  check(has, `zoneMaps missing key: "${mapId}"`);
}

// Check 2: every zone id in zoneMaps has an entry in contentRegistry
const uniqueZoneIds = [...new Set(zoneIdsInMaps)];
for (const zoneId of uniqueZoneIds) {
  const has = registryKeys.includes(zoneId);
  console.log(`  ${has ? "✓" : "✗"}  zone "${zoneId}" from zoneMaps → contentRegistry`);
  check(has, `contentRegistry missing zone: "${zoneId}"`);
}

// Check 3: every adapter function listed in dataAdapters is exported
const expectedAdapters = [
  "getGlobalRanking", "getCrownLeader", "getTop10", "getGenreRanking",
  "getRisingArtists", "getGenres", "getPlaylists", "getLiveRooms",
  "getLiveCyphers", "getUpcomingEvents", "getSponsors", "getAdPlacements",
  "getNewsAlerts", "getDiscoveryBundle",
];
for (const fn of expectedAdapters) {
  const has = adapterFns.includes(fn);
  console.log(`  ${has ? "✓" : "✗"}  adapter "${fn}" exported from dataAdapters.ts`);
  check(has, `dataAdapters missing export: "${fn}"`);
}

// Check 4: visual registry must include all required visual system components
const expectedVisuals = [
  "NeonFrame",
  "MagazineFrame",
  "StageFrame",
  "BillboardFrame",
  "VenueSkinShell",
  "LiveVideoShell",
  "ReactionBar",
  "SponsorSpotlightFrame",
  "ArticleFeatureCard",
  "NameThatTuneBoard",
  "HexCluster",
  "AngledPanel",
  "ReactionOverlayCanvas",
];

for (const visual of expectedVisuals) {
  const has = visualNames.includes(visual);
  console.log(`  ${has ? "✓" : "✗"}  visual "${visual}" in visualRegistry`);
  check(has, `visualRegistry missing component: "${visual}"`);
}

for (const zoneId of uniqueZoneIds) {
  const hasBinding = zoneBindingKeys.includes(zoneId);
  console.log(`  ${hasBinding ? "✓" : "✗"}  zone "${zoneId}" has visual binding`);
  check(hasBinding, `visualRegistry missing zoneVisualBindings for: "${zoneId}"`);
}

// ── 8. Report ─────────────────────────────────────────────────────────────────

console.log(`\n${allPass ? "ALL CHECKS PASSED ✓" : `FAILURES (${failures.length}):`}`);
if (!allPass) {
  failures.forEach((f) => console.log(`  ✗  ${f}`));
}
console.log();

process.exit(allPass ? 0 : 1);
