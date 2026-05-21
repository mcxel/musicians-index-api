#!/usr/bin/env node
import { readFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const targets = [
  "src/components/live/LiveFeedTicker.tsx",
  "src/lib/systemEventBus.ts",
  "src/components/admin/AdminMotionHUD.tsx",
];

const errors = [];
for (const file of targets) {
  try {
    const content = readFileSync(join(ROOT, file), "utf8");
    if (!/event|feed|monitor|ticker/iu.test(content)) {
      errors.push(`${file}: no monitor/feed semantics found`);
    }
  } catch {
    errors.push(`${file}: missing`);
  }
}

console.log("=== Monitor Feeds Check ===");
console.log(`Targets: ${targets.length}`);
console.log(`Errors: ${errors.length}`);
if (errors.length) {
  for (const error of errors) console.log(`- ${error}`);
  process.exitCode = 1;
}
