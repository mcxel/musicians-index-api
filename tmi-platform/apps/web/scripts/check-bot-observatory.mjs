#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const required = [
  "src/lib/botRegistry.ts",
  "src/app/bots/page.tsx",
  "scripts/seed-bot-population.mjs",
];

const errors = required.filter((file) => !existsSync(join(ROOT, file))).map((file) => `Missing ${file}`);

if (!errors.length) {
  const botPage = readFileSync(join(ROOT, "src/app/bots/page.tsx"), "utf8");
  if (!botPage.includes("bot") && !botPage.includes("Bot")) {
    errors.push("bots page does not render bot-related content");
  }
}

console.log("=== Bot Observatory Check ===");
console.log(`Errors: ${errors.length}`);
if (errors.length) {
  for (const error of errors) console.log(`- ${error}`);
  process.exitCode = 1;
}
