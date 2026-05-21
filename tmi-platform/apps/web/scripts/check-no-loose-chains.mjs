#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const report = join(ROOT, "docs", "TMI_NO_LOOSE_CHAINS_REPORT.md");

const chainFiles = [
  "src/components/lobby/LobbyWall.tsx",
  "src/components/sponsor/SponsorHub.tsx",
  "src/components/admin/AdminChainCommand.tsx",
];

const errors = [];
for (const file of chainFiles) {
  const content = readFileSync(join(ROOT, file), "utf8");
  if (!/chain/iu.test(content)) errors.push(`${file}: chain semantics missing`);
  if (!/data-testid/iu.test(content)) errors.push(`${file}: data-testid missing`);
}

writeFileSync(
  report,
  [
    "# TMI No Loose Chains Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Chain files checked: ${chainFiles.length}`,
    `Errors: ${errors.length}`,
    ...errors.map((e) => `- ${e}`),
  ].join("\n"),
);

console.log("=== No Loose Chains Check ===");
console.log(`Chain files: ${chainFiles.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Report: ${relative(ROOT, report).replace(/\\/g, "/")}`);
if (errors.length) process.exitCode = 1;
