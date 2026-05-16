/**
 * Launch Truth Gate — test runner
 * Run: pnpm exec ts-node --compiler-options '{"module":"commonjs"}' src/tests/runLaunchTruthGate.ts
 */

import { runLaunchTruthGate } from "../lib/system/LaunchTruthGateEngine";
import type { GateCheckStatus } from "../lib/system/LaunchTruthGateEngine";

// ─── Colors ───────────────────────────────────────────────────────────────────

const C: Record<GateCheckStatus | "reset" | "dim" | "bold" | "cyan" | "white", string> = {
  PASS:   "\x1b[32m",
  WARN:   "\x1b[33m",
  FAIL:   "\x1b[31m",
  reset:  "\x1b[0m",
  dim:    "\x1b[2m",
  bold:   "\x1b[1m",
  cyan:   "\x1b[36m",
  white:  "\x1b[97m",
};

function colorStatus(s: GateCheckStatus): string {
  return `${C[s]}${s.padEnd(5)}${C.reset}`;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

const report = runLaunchTruthGate();

console.log();
console.log(`${C.cyan}${C.bold}═══════════════════════════════════════════════════════════════${C.reset}`);
console.log(`${C.cyan}${C.bold}  TMI LAUNCH TRUTH GATE${C.reset}`);
console.log(`${C.cyan}${C.bold}═══════════════════════════════════════════════════════════════${C.reset}`);
console.log();

for (const result of report.checks) {
  const icon  = result.status === "PASS" ? "✓" : result.status === "WARN" ? "⚠" : "✗";
  const color = C[result.status];
  console.log(`  ${color}${icon}${C.reset} ${colorStatus(result.status)}  ${C.white}${result.name}${C.reset}`);
  if (result.status !== "PASS") {
    console.log(`          ${C.dim}${result.detail}${C.reset}`);
  }
}

console.log();
console.log(`${C.cyan}───────────────────────────────────────────────────────────────${C.reset}`);

const passCount = report.checks.filter(c => c.status === "PASS").length;
const warnCount = report.checks.filter(c => c.status === "WARN").length;
const failCount = report.checks.filter(c => c.status === "FAIL").length;
const total     = report.checks.length;

console.log(`  ${C[report.verdict]}${C.bold}VERDICT  ${report.verdict}${C.reset}`);
console.log(`  Truth Score:      ${C.bold}${report.truthScore}/100${C.reset}`);
console.log(`  Launch Readiness: ${C.bold}${report.launchReadiness}%${C.reset}`);
console.log(`  Checks:           ${C.PASS}${passCount} PASS${C.reset}  ${C.WARN}${warnCount} WARN${C.reset}  ${C.FAIL}${failCount} FAIL${C.reset}  (${total} total)`);

if (report.criticalBlockers.length > 0) {
  console.log();
  console.log(`  ${C.FAIL}${C.bold}CRITICAL BLOCKERS (${report.criticalBlockers.length})${C.reset}`);
  for (const b of report.criticalBlockers) {
    console.log(`  ${C.FAIL}  ✗ ${b}${C.reset}`);
  }
}

if (report.recommendedFixes.length > 0) {
  console.log();
  console.log(`  ${C.WARN}${C.bold}RECOMMENDED FIXES (${report.recommendedFixes.length})${C.reset}`);
  for (const f of report.recommendedFixes) {
    console.log(`  ${C.WARN}  ⚠ ${f}${C.reset}`);
  }
}

console.log(`${C.cyan}═══════════════════════════════════════════════════════════════${C.reset}`);
console.log();

process.exit(failCount > 0 ? 1 : 0);
