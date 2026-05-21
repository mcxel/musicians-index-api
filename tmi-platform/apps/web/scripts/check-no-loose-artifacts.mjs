#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const REPORT_FILE = join(ROOT, "docs", "TMI_NO_LOOSE_ARTIFACTS_REPORT.md");
const CHAINS_FILE = join(ROOT, "docs", "TMI_NO_LOOSE_CHAINS_REPORT.md");

const AUDITED_FILES = [
  "src/components/sponsor/SponsorHub.tsx",
  "src/components/sponsor/SponsorAdViewer.tsx",
  "src/components/lobby/LobbyWall.tsx",
  "src/components/billboard/BillboardRotator.tsx",
  "src/components/admin/AdminHubShell.tsx",
];

const errors = [];

for (const relPath of AUDITED_FILES) {
  const abs = join(ROOT, relPath);
  const content = readFileSync(abs, "utf8");

  const controls = content.match(/<(button|Link|a)\b[\s\S]*?>/gu) || [];
  controls.forEach((tag, index) => {
    if (!/data-testid=/.test(tag)) {
      errors.push(`${relPath}: control #${index + 1} missing data-testid`);
    }
    if (!/aria-label=/.test(tag)) {
      errors.push(`${relPath}: control #${index + 1} missing aria-label`);
    }
    if (!/data-fallback-route=/.test(tag)) {
      errors.push(`${relPath}: control #${index + 1} missing data-fallback-route`);
    }
  });

  if (!content.includes("data-testid=")) {
    errors.push(`${relPath}: no data-testid found`);
  }

  if (!content.includes("emitSystemEvent") && !content.includes("trackPipelineRoute") && !content.includes("trackArtifact")) {
    errors.push(`${relPath}: no observability event emission found`);
  }
}

const report = [
  "# TMI No Loose Artifacts Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  `Audited files: ${AUDITED_FILES.length}`,
  `Detected issues: ${errors.length}`,
  "",
  "## Issues",
  ...(errors.length ? errors.map((e) => `- ${e}`) : ["- none"]),
  "",
  "Definition: a loose artifact is a visible control without data-testid, aria-label, fallback route, or observability.",
  "",
].join("\n");

writeFileSync(REPORT_FILE, report);
writeFileSync(CHAINS_FILE, report.replace("No Loose Artifacts", "No Loose Chains"));

console.log("=== No Loose Artifacts Audit ===");
console.log(`Audited files: ${AUDITED_FILES.length}`);
console.log(`Detected issues: ${errors.length}`);
console.log(`Report: ${relative(ROOT, REPORT_FILE).replace(/\\/g, "/")}`);

if (errors.length) {
  for (const error of errors) console.log(`- ${error}`);
  process.exitCode = 1;
}
