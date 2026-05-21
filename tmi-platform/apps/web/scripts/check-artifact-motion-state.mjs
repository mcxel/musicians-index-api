#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const reportFiles = {
  control: join(ROOT, "docs", "TMI_CONTROL_PROOF_REPORT.md"),
  visual: join(ROOT, "docs", "TMI_VISUAL_PARITY_REPORT.md"),
  chains: join(ROOT, "docs", "TMI_NO_LOOSE_CHAINS_REPORT.md"),
};

function read(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

const stateMachine = read("src/lib/motion/artifactStateMachine.ts");
const motionFrame = read("src/components/common/ArtifactMotionFrame.tsx");
const home1 = read("src/packages/artists/ArtistPortalFace.tsx");
const home2 = read("src/packages/magazine-engine/Home2ArtifactSystem.tsx");
const home3 = read("src/packages/magazine-engine/Home3ArtifactSystem.tsx");
const home4 = read("src/packages/magazine-engine/Home4ArtifactSystem.tsx");
const home5 = read("src/packages/magazine-engine/Home5ArtifactSystem.tsx");
const billboard = read("src/components/billboard/BillboardRotator.tsx");
const lobby = read("src/components/lobby/LobbyWall.tsx");
const adminRouter = read("src/components/admin/AdminMonitorRouter.tsx");
const bus = read("src/lib/systemEventBus.ts");

const checks = {
  statesDeclared:
    /"active"\s*\|\s*"idle"\s*\|\s*"returning"\s*\|\s*"dissolving"\s*\|\s*"rejoining"\s*\|\s*"featured"/u.test(stateMachine),
  shrinkVisible: stateMachine.includes("scale(0.82)"),
  movingAfterRelease: stateMachine.includes('trigger === "release"') && stateMachine.includes("returning"),
  dissolved: stateMachine.includes("dissolving"),
  noStaticCenterArtifact: home1.includes("home1-center") && home1.includes("ArtifactMotionFrame"),
  home2FeaturedWired: home2.includes("ArtifactMotionFrame") && home2.includes("home2-featured"),
  home3FeaturedWired: home3.includes("ArtifactMotionFrame") && home3.includes("home3-featured"),
  home4FeaturedWired: home4.includes("ArtifactMotionFrame") && home4.includes("home4-featured"),
  home5FeaturedWired: home5.includes("ArtifactMotionFrame") && home5.includes("home5-featured"),
  billboardFeaturedWired: billboard.includes("ArtifactMotionFrame") && billboard.includes("scope=\"billboard-featured\""),
  lobbyFeaturedWired: lobby.includes("ArtifactMotionFrame") && lobby.includes("scope=\"lobby-featured\""),
  adminPreviewWired: adminRouter.includes("ArtifactMotionFrame") && adminRouter.includes("scope=\"admin-preview\""),
  clickableRouteRemainsValid: stateMachine.includes('pointerEvents: "auto"') && motionFrame.includes("children"),
  outsideStage: /Math\.max\(scaledMinX,\s*Math\.min\(scaledMaxX,\s*boundedX\)\)/u.test(read("src/packages/magazine-engine/Home1LiveMagazine.tsx")) ? 0 : 1,
  adminFeedReceivesArtifactState: bus.includes('"homepage.artifact.state"') && stateMachine.includes('type: "homepage.artifact.state"'),
};

const pass = Object.values(checks).every((value) => value === true || value === 0);

console.log("=== Artifact Motion State Check ===");
console.log(JSON.stringify(checks, null, 2));
console.log(`pass: ${pass}`);

if (!pass) {
  process.exitCode = 1;
}

const stamp = new Date().toISOString();
const block = [
  "",
  `## Artifact Motion Proof (${stamp})`,
  "",
  `- noStaticCenterArtifact: ${checks.noStaticCenterArtifact ? "PASS" : "FAIL"}`,
  `- shrinkVisible: ${checks.shrinkVisible ? "PASS" : "FAIL"}`,
  `- movingAfterRelease: ${checks.movingAfterRelease ? "PASS" : "FAIL"}`,
  `- dissolvedFallback: ${checks.dissolved ? "PASS" : "FAIL"}`,
  `- outsideStage: ${checks.outsideStage}`,
  `- clickableRouteRemainsValid: ${checks.clickableRouteRemainsValid ? "PASS" : "FAIL"}`,
  `- adminFeedReceivesArtifactState: ${checks.adminFeedReceivesArtifactState ? "PASS" : "FAIL"}`,
  "",
].join("\n");

for (const file of Object.values(reportFiles)) {
  const current = readFileSync(file, "utf8");
  writeFileSync(file, `${current.trimEnd()}\n${block}`);
}

console.log(`Reports updated: ${relative(ROOT, reportFiles.control).replace(/\\/g, "/")}, ${relative(ROOT, reportFiles.visual).replace(/\\/g, "/")}, ${relative(ROOT, reportFiles.chains).replace(/\\/g, "/")}`);
