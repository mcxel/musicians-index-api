#!/usr/bin/env node
import { existsSync, writeFileSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const report = join(ROOT, "docs", "TMI_VISUAL_PARITY_REPORT.md");

const requiredViews = [
  "src/app/home/1/page.tsx",
  "src/components/lobby/LobbyWall.tsx",
  "src/components/sponsor/SponsorHub.tsx",
  "src/components/billboard/BillboardRotator.tsx",
  "src/components/admin/AdminHubShell.tsx",
];

const missing = requiredViews.filter((file) => !existsSync(join(ROOT, file)));

writeFileSync(
  report,
  [
    "# TMI Visual Parity Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Required surfaces: ${requiredViews.length}`,
    `Missing surfaces: ${missing.length}`,
    ...missing.map((m) => `- ${m}`),
  ].join("\n"),
);

console.log("=== Visual Parity Check ===");
console.log(`Required surfaces: ${requiredViews.length}`);
console.log(`Missing surfaces: ${missing.length}`);
console.log(`Report: ${relative(ROOT, report).replace(/\\/g, "/")}`);
if (missing.length) process.exitCode = 1;
