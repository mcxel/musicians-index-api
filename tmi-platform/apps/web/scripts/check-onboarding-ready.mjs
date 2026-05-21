#!/usr/bin/env node
import { existsSync, writeFileSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const report = join(ROOT, "docs", "TMI_ONBOARDING_READY_REPORT.md");

const requiredRoutes = [
  "src/app/onboarding/page.tsx",
  "src/app/onboarding/fan/page.tsx",
  "src/app/onboarding/artist/page.tsx",
  "src/app/onboarding/admin/page.tsx",
  "src/app/login/page.tsx",
  "src/app/auth/page.tsx",
];

const missing = requiredRoutes.filter((file) => !existsSync(join(ROOT, file)));

writeFileSync(
  report,
  [
    "# TMI Onboarding Ready Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Required route files: ${requiredRoutes.length}`,
    `Missing: ${missing.length}`,
    ...missing.map((m) => `- ${m}`),
  ].join("\n"),
);

console.log("=== Onboarding Readiness Check ===");
console.log(`Required: ${requiredRoutes.length}`);
console.log(`Missing: ${missing.length}`);
console.log(`Report: ${relative(ROOT, report).replace(/\\/g, "/")}`);
if (missing.length) process.exitCode = 1;
