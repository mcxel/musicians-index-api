#!/usr/bin/env node
/**
 * envTruth.mjs
 * Validates that all required environment variables are set before deployment.
 * Run: node scripts/envTruth.mjs [--env .env.local]
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const REQUIRED_VARS = [
  // Auth
  { key: "NEXTAUTH_SECRET",      critical: true,  desc: "NextAuth session signing secret" },
  { key: "NEXTAUTH_URL",         critical: true,  desc: "Canonical URL for NextAuth redirects" },
  // Database
  { key: "DATABASE_URL",         critical: true,  desc: "Postgres/PlanetScale connection string" },
  // Stripe
  { key: "STRIPE_SECRET_KEY",    critical: true,  desc: "Stripe secret key (sk_live or sk_test)" },
  { key: "STRIPE_WEBHOOK_SECRET",critical: true,  desc: "Stripe webhook signing secret" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", critical: true, desc: "Stripe publishable key" },
  // Julius AI
  { key: "JULIUS_API_KEY",       critical: false, desc: "Julius AI gateway key" },
  { key: "JULIUS_WS_URL",        critical: false, desc: "Julius WebSocket endpoint" },
  // Storage
  { key: "STORAGE_BUCKET_URL",   critical: false, desc: "S3-compatible media bucket" },
  // App
  { key: "NEXT_PUBLIC_APP_URL",  critical: true,  desc: "Public-facing app URL" },
  { key: "NODE_ENV",             critical: true,  desc: "production | development" },
];

const STRIPE_MODE_VARS = [
  { key: "STRIPE_SECRET_KEY",               prefix: "sk_live", warningPrefix: "sk_test" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", prefix: "pk_live", warningPrefix: "pk_test" },
];

function loadEnvFile(envPath) {
  const vars = {};
  if (!existsSync(envPath)) return vars;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    vars[key] = value;
  }
  return vars;
}

function resolveVar(key, envFile) {
  return envFile[key] ?? process.env[key] ?? null;
}

function main() {
  const args = process.argv.slice(2);
  const envFlagIdx = args.indexOf("--env");
  const envFilePath = envFlagIdx >= 0
    ? resolve(process.cwd(), args[envFlagIdx + 1])
    : resolve(ROOT, "apps/web/.env.local");

  const envFile = loadEnvFile(envFilePath);
  const results = [];

  console.log("\n═══ ENV TRUTH CHECK ════════════════════════════");
  console.log(`  File   : ${envFilePath}`);
  console.log(`  NODE_ENV: ${process.env.NODE_ENV ?? envFile["NODE_ENV"] ?? "not set"}`);
  console.log("─────────────────────────────────────────────────");

  for (const spec of REQUIRED_VARS) {
    const val = resolveVar(spec.key, envFile);
    const missing = val === null || val === "";
    const status = missing
      ? (spec.critical ? "FAIL" : "WARN")
      : "PASS";
    results.push({ key: spec.key, status, missing, critical: spec.critical, desc: spec.desc });
    const icon = status === "PASS" ? "✓" : status === "WARN" ? "⚠" : "✗";
    console.log(`  ${icon} [${status}] ${spec.key.padEnd(38)} ${missing ? "(not set)" : "(set)"}`);
    if (!missing && spec.critical && val === "CHANGEME") {
      console.log(`       → value is placeholder "CHANGEME"`);
    }
  }

  // Stripe mode check
  const isProduction = (process.env.NODE_ENV ?? envFile["NODE_ENV"]) === "production";
  if (isProduction) {
    console.log("\n  — Production Stripe mode check:");
    for (const check of STRIPE_MODE_VARS) {
      const val = resolveVar(check.key, envFile);
      if (val && val.startsWith(check.warningPrefix)) {
        console.log(`  ⚠ [WARN] ${check.key} is using TEST key in production!`);
        results.push({ key: check.key, status: "WARN", missing: false, critical: true, desc: "test key in prod" });
      }
    }
  }

  console.log("═════════════════════════════════════════════════");
  const failures = results.filter((r) => r.status === "FAIL");
  const warnings = results.filter((r) => r.status === "WARN");
  console.log(`  PASS: ${results.filter((r) => r.status === "PASS").length}  WARN: ${warnings.length}  FAIL: ${failures.length}`);

  if (failures.length > 0) {
    console.log("\n  MISSING CRITICAL VARS:");
    for (const f of failures) console.log(`    - ${f.key}: ${f.desc}`);
    console.log("");
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log("\n  Warnings — non-critical, but review before launch.\n");
    process.exit(0);
  }

  console.log("\n  ALL REQUIRED ENV VARS SET\n");
  process.exit(0);
}

main();
