#!/usr/bin/env node
import { spawnSync } from "child_process";

const checks = [
  "scripts/check-controls-proof.mjs",
  "scripts/check-profile-monitors.mjs",
  "scripts/check-admin-monitor-router.mjs",
  "scripts/check-monitor-feeds.mjs",
  "scripts/check-artifact-motion-state.mjs",
  "scripts/check-homepage-article-routes.mjs",
];

let failed = 0;
for (const check of checks) {
  const result = spawnSync(process.execPath, [check], { stdio: "inherit" });
  if (result.status !== 0) failed += 1;
}

console.log("=== All Controls Check ===");
console.log(`Total checks: ${checks.length}`);
console.log(`Failed checks: ${failed}`);
if (failed) process.exitCode = 1;
