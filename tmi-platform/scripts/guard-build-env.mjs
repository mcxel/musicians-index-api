#!/usr/bin/env node
/**
 * guard-build-env.mjs
 * Strips Vercel env contamination and spawns next build cleanly.
 * Run: node scripts/guard-build-env.mjs
 */

import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const WEB = resolve(ROOT, "apps/web");

// Vars that cause next build to behave differently in Vercel CI vs local
const VERCEL_CONTAMINATION = [
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_REGION",
  "VERCEL_GIT_COMMIT_SHA",
  "VERCEL_GIT_COMMIT_MESSAGE",
  "VERCEL_GIT_COMMIT_AUTHOR_NAME",
  "VERCEL_GIT_COMMIT_REF",
  "VERCEL_GIT_REPO_SLUG",
  "VERCEL_GIT_REPO_OWNER",
  "VERCEL_GIT_REPO_ID",
  "VERCEL_GIT_PROVIDER",
  "NEXT_DEPLOYMENT_ID",
  "CI",
  "CONTINUOUS_INTEGRATION",
];

for (const key of VERCEL_CONTAMINATION) {
  delete process.env[key];
}

// Force local defaults if not already set
process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.NEXT_TELEMETRY_DISABLED = "1";

console.log("\n  [guard-build-env] Contamination stripped — spawning next build...\n");

try {
  execSync("pnpm build", {
    cwd: WEB,
    stdio: "inherit",
    env: process.env,
  });
  console.log("\n  [guard-build-env] Build complete.\n");
  process.exit(0);
} catch (e) {
  console.error("\n  [guard-build-env] Build FAILED.\n");
  process.exit(1);
}
