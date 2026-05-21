#!/usr/bin/env node
import { spawnSync } from "child_process";

const checks = [
  "scripts/check-component-capabilities.mjs",
  "scripts/check-controls-proof.mjs",
  "scripts/check-no-loose-artifacts.mjs",
  "scripts/check-no-loose-chains.mjs",
  "scripts/check-artifact-motion-state.mjs",
  "scripts/check-homepage-article-routes.mjs",
];

let failed = 0;
for (const check of checks) {
  const result = spawnSync(process.execPath, [check], { stdio: "inherit" });
  if (result.status !== 0) failed += 1;
}

console.log("=== Master Capabilities Check ===");
console.log(`Total checks: ${checks.length}`);
console.log(`Failed checks: ${failed}`);
if (failed) process.exitCode = 1;
