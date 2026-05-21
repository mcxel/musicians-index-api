#!/usr/bin/env node
import { readFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const files = [
  "src/components/admin/AdminHubShell.tsx",
  "src/components/admin/AdminMonitorRouter.tsx",
  "src/lib/adminRouteMap.ts",
];

const errors = [];
for (const file of files) {
  try {
    readFileSync(join(ROOT, file), "utf8");
  } catch {
    errors.push(`Missing required file: ${file}`);
  }
}

if (!errors.length) {
  const shell = readFileSync(join(ROOT, "src/components/admin/AdminHubShell.tsx"), "utf8");
  if (!shell.includes("AdminMonitorRouter")) errors.push("AdminHubShell does not mount AdminMonitorRouter");
  if (!shell.includes("monitor")) errors.push("AdminHubShell missing monitor query routing");
}

console.log("=== Admin Monitor Router Check ===");
console.log(`Errors: ${errors.length}`);
if (errors.length) {
  for (const error of errors) console.log(`- ${error}`);
  process.exitCode = 1;
}
