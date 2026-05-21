#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");
const REGISTRY_FILE = join(SRC_DIR, "lib", "controls", "controlRegistry.ts");
const REPORT_FILE = join(ROOT, "docs", "TMI_CONTROL_PROOF_REPORT.md");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function parseControls(source) {
  const blocks = source.match(/\{[\s\S]*?observableEvent:\s*"[^"]+"[\s\S]*?\},/gu) || [];
  return blocks.map((block) => ({
    id: /id:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    type: /type:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    route: /route:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    fallbackRoute: /fallbackRoute:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    dataTestId: /dataTestId:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    ariaLabel: /ariaLabel:\s*"([^"]+)"/u.exec(block)?.[1] || "",
    observableEvent: /observableEvent:\s*"([^"]+)"/u.exec(block)?.[1] || "",
  }));
}

const source = readFileSync(REGISTRY_FILE, "utf8");
const controls = parseControls(source);
const fullSource = walk(SRC_DIR)
  .filter((f) => /\.(tsx?|jsx?|mjs)$/u.test(f))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const errors = [];
for (const control of controls) {
  if (!control.id) errors.push("Control with missing id");
  if (!control.route) errors.push(`${control.id}: missing route`);
  if (!control.fallbackRoute) errors.push(`${control.id}: missing fallbackRoute`);
  if (!control.dataTestId) errors.push(`${control.id}: missing dataTestId`);
  if (!control.ariaLabel) errors.push(`${control.id}: missing ariaLabel`);
  if (!control.observableEvent) errors.push(`${control.id}: missing observableEvent`);

  if (control.dataTestId && !fullSource.includes(`data-testid=\"${control.dataTestId}\"`)) {
    const testIdPrefix = control.dataTestId.split("${")[0];
    if (!fullSource.includes(control.dataTestId) && !fullSource.includes(testIdPrefix)) {
      errors.push(`${control.id}: data-testid not found in source (${control.dataTestId})`);
    }
  }

  if (control.ariaLabel && !fullSource.includes(control.ariaLabel)) {
    const ariaPrefix = control.ariaLabel.split("${")[0].trim();
    if (!ariaPrefix || !fullSource.includes(ariaPrefix)) {
      errors.push(`${control.id}: aria-label not found in source (${control.ariaLabel})`);
    }
  }
}

const requiredEngines = [
  "src/lib/controls/sliderEngine.ts",
  "src/lib/controls/chevronRouter.ts",
  "src/lib/controls/dragCanvasEngine.ts",
  "src/lib/controls/videoControlEngine.ts",
];

for (const file of requiredEngines) {
  const abs = join(ROOT, file);
  try {
    readFileSync(abs, "utf8");
  } catch {
    errors.push(`Missing control engine file: ${file}`);
  }
}

const checks = [
  ["buttons", controls.some((c) => c.type === "button")],
  ["chevrons", controls.some((c) => c.type === "chevron")],
  ["sliders", readFileSync(join(ROOT, "src/lib/controls/sliderEngine.ts"), "utf8").includes("useSliderEngine")],
  ["draggable cards/canvas", readFileSync(join(ROOT, "src/lib/controls/dragCanvasEngine.ts"), "utf8").includes("useDragCanvasEngine")],
  ["video/audio controls", readFileSync(join(ROOT, "src/lib/controls/videoControlEngine.ts"), "utf8").includes("useVideoControlEngine")],
];

writeFileSync(
  REPORT_FILE,
  [
    "# TMI Control Proof Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Registered controls: ${controls.length}`,
    "",
    "## Checks",
    ...checks.map(([label, ok]) => `- ${label}: ${ok ? "PASS" : "FAIL"}`),
    "",
    "## Validation Errors",
    ...errors.map((e) => `- ${e}`),
  ].join("\n"),
);

console.log("=== Controls Proof Audit ===");
console.log(`Controls mapped: ${controls.length}`);
console.log(`Validation errors: ${errors.length}`);
console.log(`Report: ${relative(ROOT, REPORT_FILE).replace(/\\/g, "/")}`);
if (errors.length) {
  for (const error of errors) console.log(`- ${error}`);
  process.exitCode = 1;
}
