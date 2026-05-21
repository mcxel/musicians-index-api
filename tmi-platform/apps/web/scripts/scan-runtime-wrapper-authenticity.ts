import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

type Finding = {
  file: string;
  severity: "high" | "medium" | "low";
  message: string;
};

const ROOT = join(process.cwd(), "src");
const TARGET_EXT = new Set([".ts", ".tsx", ".js", ".jsx"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "build"]);
const SKIP_FILES_FOR_IMG_CHECK = [
  "src\\components\\visual-enforcement\\ImageSlotWrapper.tsx",
  "src\\lib\\vision\\scan-authority-wrapper-integrity.ts",
  "src\\lib\\vision\\scan-no-static-bypass.ts",
  "src\\components\\visual-enforcement\\index.ts",
];

const REQUIRED_WRAPPERS = [
  "VisualAuthorityGateway",
  "AIVisualReplacementRouter",
  "RuntimeImageHydrationQueue",
  "DynamicMagazineImageResolver",
  "PerformerMotionPortraitEngine",
  "VenueAssetReconstructionPipeline",
  "AvatarAssetGenerationEngine",
];

const findings: Finding[] = [];

function walk(dir: string, out: string[]) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (TARGET_EXT.has(extname(name))) out.push(full);
  }
}

function add(file: string, severity: Finding["severity"], message: string) {
  findings.push({ file: file.replace(process.cwd() + "\\", ""), severity, message });
}

function shouldSkipImgHeuristic(file: string): boolean {
  const rel = file.replace(process.cwd() + "\\", "");
  return SKIP_FILES_FOR_IMG_CHECK.includes(rel);
}

const files: string[] = [];
walk(ROOT, files);

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const relFile = file.replace(process.cwd() + "\\", "");

  if (!shouldSkipImgHeuristic(file) && /<img\b/i.test(content)) {
    add(file, "medium", "Raw <img> tag detected; verify governed wrapper is used for public surfaces.");
  }

  if (!shouldSkipImgHeuristic(file) && /src\s*=\s*["'][^"{][^"']*["']/.test(content)) {
    add(file, "medium", "Static src= literal detected; verify authority routing + hydration queue.");
  }

  const pdfPathRef = /(\/Tmi PDF's\/|\/Tmi PDF 2 li\/|\\Tmi PDF's\\|\\Tmi PDF 2 li\\|\.pdf['"`]?)/i.test(content);
  const staticVisualBinding = /(src\s*=\s*["'`][^"'`]+["'`]|backgroundImage\s*:\s*`?\s*url\(|poster(Frame)?Url\s*[:=]\s*["'`])/.test(content);
  const scanOrRegistryFile = /scan-|Registry|Extractor|Decompiler|Analyzer/i.test(relFile);
  if (pdfPathRef && staticVisualBinding && !scanOrRegistryFile) {
    add(file, "high", "Likely direct PDF-derived asset bound to runtime visual slot.");
  }

  if (/placeholder|stock imagery|frozen thumbnail|fallback chain/i.test(content)) {
    add(file, "low", "Fallback/placeholder wording found; validate fallback is recoverable and temporary.");
  }

  if (/ImageSlotWrapper|MagazineSlotWrapper|PerformerPortraitWrapper|VenueReconstructionWrapper/.test(content)) {
    const hasTelemetry = /data-telemetry|onStateChange|VisualRuntimeObserver|RouteObservability/.test(content);
    const isWrapperImpl = /src\\components\\visual-enforcement\\/.test(relFile);
    if (!hasTelemetry && !isWrapperImpl) {
      add(file, "low", "Governed wrapper usage without obvious telemetry hook.");
    }
  }
}

const wrapperPresence = REQUIRED_WRAPPERS.map((name) => {
  const exists = files.some((f) => readFileSync(f, "utf8").includes(name));
  return { name, exists };
});

console.log("=== Runtime Wrapper Authenticity Scan ===");
console.log(`Files scanned: ${files.length}`);
console.log("");

console.log("Required wrapper/engine symbol presence:");
for (const p of wrapperPresence) {
  console.log(`- ${p.name}: ${p.exists ? "FOUND" : "MISSING"}`);
  if (!p.exists) {
    findings.push({
      file: "GLOBAL",
      severity: "medium",
      message: `Required symbol not found in repository scan: ${p.name}`,
    });
  }
}

console.log("");
if (!findings.length) {
  console.log("No issues detected by authenticity heuristics.");
  process.exit(0);
}

const bySeverity = {
  high: findings.filter((f) => f.severity === "high"),
  medium: findings.filter((f) => f.severity === "medium"),
  low: findings.filter((f) => f.severity === "low"),
};

console.log("Findings:");
for (const sev of ["high", "medium", "low"] as const) {
  if (!bySeverity[sev].length) continue;
  console.log(`\n[${sev.toUpperCase()}] ${bySeverity[sev].length}`);
  for (const f of bySeverity[sev]) {
    console.log(`- ${f.file}: ${f.message}`);
  }
}

if (bySeverity.high.length > 0) {
  process.exit(2);
}

console.log("\nWARN: authenticity scan has non-blocking medium/low findings.");
process.exit(0);
