#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const required = [
  "src/components/profile/ProfileMonitor.tsx",
  "src/components/live/PresenceBar.tsx",
  "src/components/live/LiveFeedTicker.tsx",
];

const errors = [];
for (const file of required) {
  const abs = join(ROOT, file);
  if (!existsSync(abs)) {
    errors.push(`Missing: ${file}`);
  }
}

if (!errors.length) {
  const profile = readFileSync(join(ROOT, "src/components/profile/ProfileMonitor.tsx"), "utf8");
  if (!profile.includes("data-testid")) errors.push("ProfileMonitor missing data-testid");
  if (!profile.includes("aria-label")) errors.push("ProfileMonitor missing aria-label");
}

console.log("=== Profile Monitor Check ===");
console.log(`Errors: ${errors.length}`);
if (errors.length) {
  for (const error of errors) console.log(`- ${error}`);
  process.exitCode = 1;
}
