#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");
const APP_DIR = join(SRC_DIR, "app");
const REGISTRY_FILE = join(SRC_DIR, "lib", "capabilities", "componentCapabilityRegistry.ts");
const REPORT_FILE = join(ROOT, "docs", "TMI_COMPONENT_CAPABILITY_MAP.md");
const MASTER_FILE = join(ROOT, "docs", "TMI_MASTER_CAPABILITY_MAP.md");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function pageRoutes() {
  const files = walk(APP_DIR).filter((f) => /page\.(tsx|jsx)$/u.test(f));
  const routes = files.map((file) => {
    const rel = relative(APP_DIR, file).replace(/\\/g, "/");
    const routePath = rel.replace(/\/page\.(tsx|jsx)$/u, "").replace(/^page\.(tsx|jsx)$/u, "");
    const segments = routePath.split("/").filter(Boolean).filter((seg) => !seg.startsWith("(") && !seg.startsWith("@"));
    return `/${segments.join("/")}` || "/";
  });
  return new Set(routes);
}

function parseCapabilities(source) {
  const blocks = source.match(/\{[\s\S]*?proofStatus:\s*"(mapped|wired|verified)"[\s\S]*?\},/gu) || [];
  return blocks.map((block) => ({
    id: /id:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    route: /route:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    fallbackRoute: /fallbackRoute:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    dataTestId: /dataTestId:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    ariaLabel: /ariaLabel:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    componentPath: /componentPath:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    proofStatus: /proofStatus:\s*"([^"]+)"/u.exec(block)?.[1] || "",
  }));
}

const registrySource = readFileSync(REGISTRY_FILE, "utf8");
const capabilities = parseCapabilities(registrySource);
const routes = pageRoutes();
const sourceText = walk(SRC_DIR)
  .filter((f) => /\.(tsx?|jsx?|mjs)$/u.test(f))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const errors = [];
for (const row of capabilities) {
  if (!row.id) errors.push("Capability with missing id");
  if (!row.route) errors.push(`${row.id}: missing route`);
  if (!row.fallbackRoute) errors.push(`${row.id}: missing fallbackRoute`);
  if (!row.dataTestId) errors.push(`${row.id}: missing dataTestId`);
  if (!row.ariaLabel) errors.push(`${row.id}: missing ariaLabel`);
  if (!row.componentPath) errors.push(`${row.id}: missing componentPath`);

  const routeKnown = routes.has(row.route) || /\[[^\]]+\]/u.test(row.route);
  if (!routeKnown) errors.push(`${row.id}: unknown route ${row.route}`);

  if (row.dataTestId && !sourceText.includes(`data-testid=\"${row.dataTestId}\"`) && !sourceText.includes(`data-testid={\`${row.dataTestId}`)) {
    errors.push(`${row.id}: data-testid not found in source (${row.dataTestId})`);
  }

  if (row.ariaLabel && !sourceText.includes(`aria-label=\"${row.ariaLabel}\"`)) {
    errors.push(`${row.id}: aria-label not found in source (${row.ariaLabel})`);
  }
}

const lines = [
  "# TMI Component Capability Map",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "| id | route | fallback | data-testid | aria-label | proof |",
  "| --- | --- | --- | --- | --- | --- |",
  ...capabilities.map((row) => `| ${row.id} | ${row.route} | ${row.fallbackRoute} | ${row.dataTestId} | ${row.ariaLabel} | ${row.proofStatus} |`),
  "",
  `Validation errors: ${errors.length}`,
  ...errors.map((e) => `- ${e}`),
  "",
];

writeFileSync(REPORT_FILE, lines.join("\n"));
writeFileSync(MASTER_FILE, lines.join("\n"));

console.log("=== Component Capability Audit ===");
console.log(`Capabilities mapped: ${capabilities.length}`);
console.log(`Validation errors: ${errors.length}`);
console.log(`Report: ${relative(ROOT, REPORT_FILE).replace(/\\/g, "/")}`);

if (errors.length > 0) {
  for (const error of errors) console.log(`- ${error}`);
  process.exitCode = 1;
}
