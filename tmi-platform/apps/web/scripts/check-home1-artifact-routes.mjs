import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const mapFile = resolve(projectRoot, "src/packages/magazine-engine/home1ArtifactMap.ts");
const appDir = resolve(projectRoot, "src/app");

function extractRoutes(source) {
  const routeTargets = [...source.matchAll(/routeTarget:\s*"([^"]+)"/g)].map((m) => m[1]);
  const fallbackRoutes = [...source.matchAll(/fallbackRoute:\s*"([^"]+)"/g)].map((m) => m[1]);
  return { routeTargets, fallbackRoutes };
}

function resolveRouteDirectory(baseDir, segments, index = 0) {
  if (index >= segments.length) {
    return [baseDir];
  }

  const segment = segments[index];
  const literalPath = resolve(baseDir, segment);
  const matches = [];

  if (existsSync(literalPath)) {
    matches.push(...resolveRouteDirectory(literalPath, segments, index + 1));
  }

  if (existsSync(baseDir)) {
    const dynamicDirs = readdirSync(baseDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("[") && entry.name.endsWith("]"))
      .map((entry) => resolve(baseDir, entry.name));

    for (const dir of dynamicDirs) {
      matches.push(...resolveRouteDirectory(dir, segments, index + 1));
    }
  }

  return matches;
}

function routeExists(route) {
  const clean = route.split("?")[0].split("#")[0].replace(/^\//, "");
  const segments = clean ? clean.split("/").filter(Boolean) : [];
  const resolvedDirs = resolveRouteDirectory(appDir, segments);

  return resolvedDirs.some((dir) => {
    return existsSync(resolve(dir, "page.tsx")) || existsSync(resolve(dir, "route.ts"));
  });
}

function routeIsTemplate(route) {
  return route.includes("[slug]") || route.includes("[id]") || route.includes("[feature]");
}

const source = readFileSync(mapFile, "utf8");
const { routeTargets, fallbackRoutes } = extractRoutes(source);

let failed = false;
const missing = [];

if (routeTargets.length === 0) {
  failed = true;
  missing.push("No routeTarget entries found in home1ArtifactMap.ts");
}

if (fallbackRoutes.length === 0) {
  failed = true;
  missing.push("No fallbackRoute entries found in home1ArtifactMap.ts");
}

for (const route of [...routeTargets, ...fallbackRoutes]) {
  if (routeIsTemplate(route)) {
    continue;
  }

  if (!routeExists(route)) {
    failed = true;
    missing.push(`Missing route file for ${route}`);
  }
}

const routeTargetCount = routeTargets.length;
const fallbackCount = fallbackRoutes.length;

console.log("\n=== HOME1 ARTIFACT ROUTE CHECK ===");
console.log(`routeTarget count: ${routeTargetCount}`);
console.log(`fallbackRoute count: ${fallbackCount}`);

if (failed) {
  console.log("\nFAIL");
  for (const item of missing) {
    console.log(`  - ${item}`);
  }
  process.exit(1);
}

console.log("\nPASS: all non-template Home1 artifact routes resolve to app files.");
process.exit(0);
