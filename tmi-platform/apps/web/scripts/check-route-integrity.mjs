#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "fs";
import { extname, join, relative } from "path";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");
const APP_DIR = join(SRC_DIR, "app");

const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const IGNORE_DIRS = new Set([".next", "node_modules", "dist", "build"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function toRouteFromPage(pageFile) {
  const rel = relative(APP_DIR, pageFile).replace(/\\/g, "/");
  if (!rel.endsWith("/page.tsx") && !rel.endsWith("/page.jsx") && rel !== "page.tsx" && rel !== "page.jsx") {
    return null;
  }
  const routePath = rel.replace(/\/page\.(tsx|jsx)$/u, "").replace(/^page\.(tsx|jsx)$/u, "");
  const segments = routePath.split("/").filter(Boolean).filter((seg) => !seg.startsWith("(") && !seg.startsWith("@"));
  return `/${segments.join("/")}` || "/";
}

function routeToRegex(route) {
  const escaped = route
    .split("/")
    .map((seg) => {
      if (!seg) return "";
      if (/^\[\.\.\..+\]$/u.test(seg)) return ".+";
      if (/^\[\[\.\.\..+\]\]$/u.test(seg)) return ".*";
      if (/^\[.+\]$/u.test(seg)) return "[^/]+";
      return seg.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    })
    .join("/");
  return new RegExp(`^${escaped}$`, "u");
}

function extractInternalRoutes(content) {
  const refs = [];
  const patterns = [
    /\bhref\s*=\s*["'`]([^"'`]+)["'`]/gu,
    /\brouter\.push\(\s*["'`]([^"'`]+)["'`]/gu,
    /\bctaHref\s*=\s*["'`]([^"'`]+)["'`]/gu,
    /\brouteTarget\s*[:=]\s*["'`]([^"'`]+)["'`]/gu,
    /\bfallbackRoute\s*[:=]\s*["'`]([^"'`]+)["'`]/gu,
  ];

  for (const re of patterns) {
    let m;
    while ((m = re.exec(content)) !== null) {
      const raw = m[1]?.trim();
      if (!raw || !raw.startsWith("/")) continue;
      if (raw.startsWith("//")) continue;
      if (raw.includes("${")) continue;
      if (raw.startsWith("/api/")) continue;
      refs.push(raw.split("?")[0].split("#")[0]);
    }
  }

  return refs;
}

const allFiles = walk(SRC_DIR);
const pageFiles = allFiles.filter((f) => /page\.(tsx|jsx)$/u.test(f) && f.includes(`${APP_DIR}`));
const codeFiles = allFiles.filter((f) => CODE_EXT.has(extname(f)));

const routes = pageFiles.map(toRouteFromPage).filter(Boolean);
const routeSet = new Set(routes);
const dynamicMatchers = routes.map((route) => ({ route, re: routeToRegex(route) }));

const missing = [];
for (const file of codeFiles) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const content = readFileSync(file, "utf8");
  const refs = extractInternalRoutes(content);
  for (const ref of refs) {
    const okExact = routeSet.has(ref);
    const okDynamic = dynamicMatchers.some((m) => m.re.test(ref));
    if (!okExact && !okDynamic) {
      missing.push({ file: rel, route: ref });
    }
  }
}

const dedup = new Map();
for (const item of missing) {
  const key = `${item.file}::${item.route}`;
  dedup.set(key, item);
}
const unresolved = [...dedup.values()].sort((a, b) => `${a.route}:${a.file}`.localeCompare(`${b.route}:${b.file}`));

console.log("=== Route Integrity Audit ===");
console.log(`Known routes: ${routes.length}`);
console.log(`Code files scanned: ${codeFiles.length}`);
console.log(`Unresolved refs: ${unresolved.length}`);

if (unresolved.length > 0) {
  console.log("\nMissing route references:");
  for (const row of unresolved) {
    console.log(`- ${row.route}  <-  ${row.file}`);
  }
  process.exitCode = 1;
} else {
  console.log("All scanned internal routes resolved.");
}
