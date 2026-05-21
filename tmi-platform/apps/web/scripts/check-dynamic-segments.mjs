#!/usr/bin/env node

import { readdir, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const APP_ROOT = path.resolve(process.cwd(), "src", "app");
const ROUTE_FILES = new Set([
  "page.tsx",
  "page.ts",
  "layout.tsx",
  "layout.ts",
  "route.ts",
  "route.tsx",
  "default.tsx",
  "default.ts",
  "loading.tsx",
  "loading.ts",
  "error.tsx",
  "error.ts",
  "template.tsx",
  "template.ts",
]);
const REQUIRED_HOME_ISSUES = [
  "1", "2", "3", "4", "5",
  "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15",
];

function isDynamicSegment(name) {
  return /^\[[^\]]+\]$/.test(name);
}

async function hasRouteFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isFile() && ROUTE_FILES.has(entry.name)) {
      return true;
    }
    if (entry.isDirectory()) {
      if (await hasRouteFiles(fullPath)) {
        return true;
      }
    }
  }

  return false;
}

async function collectActiveDynamicSegments(dirPath, byParent) {
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const fullPath = path.join(dirPath, entry.name);

    if (isDynamicSegment(entry.name) && (await hasRouteFiles(fullPath))) {
      const parent = path.relative(APP_ROOT, dirPath) || ".";
      if (!byParent.has(parent)) {
        byParent.set(parent, new Set());
      }
      byParent.get(parent).add(entry.name);
    }

    await collectActiveDynamicSegments(fullPath, byParent);
  }
}

async function main() {
  const byParent = new Map();
  await collectActiveDynamicSegments(APP_ROOT, byParent);

  const conflicts = [];
  for (const [parent, segments] of byParent.entries()) {
    if (segments.size > 1) {
      conflicts.push({ parent, segments: [...segments].sort() });
    }
  }

  if (conflicts.length === 0) {
    const missingIssueRoutes = [];
    for (const issue of REQUIRED_HOME_ISSUES) {
      const pagePath = path.join(APP_ROOT, "home", issue, "page.tsx");
      try {
        await access(pagePath);
      } catch {
        missingIssueRoutes.push(`src/app/home/${issue}/page.tsx`);
      }
    }

    if (missingIssueRoutes.length > 0) {
      console.error("Required home issue routes are missing:");
      for (const routePath of missingIssueRoutes) {
        console.error(`- ${routePath}`);
      }
      process.exit(1);
    }

    console.log("Dynamic segment naming check passed.");
    console.log("Required home issue routes check passed.");
    process.exit(0);
  }

  console.error("Dynamic segment naming conflicts found:");
  for (const conflict of conflicts) {
    console.error(`- src/app/${conflict.parent}: ${conflict.segments.join(", ")}`);
  }
  console.error("Use one dynamic segment name per path level (canonical: [slug]).");
  process.exit(1);
}

main().catch((error) => {
  console.error("Failed to run dynamic segment naming check.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
