/**
 * GATE 3 — E2E Go Live Broadcast Convergence proof
 * Reuses the locked T3/T4 runtime cert (create → discover → host/guest same room → end).
 * Does NOT invent a second live system.
 *
 * node scripts/gate3-broadcast-proof.mjs
 * pnpm run cert:gate3
 *
 * Physical phone proof is still required for mic/cam/WebRTC (see PHYSICAL_VERIFICATION_GUIDE.md).
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "tmp", "gate3-broadcast-proof");
const CHILD = path.join(__dirname, "cert-t3-t4-runtime.mjs");

fs.mkdirSync(OUT_DIR, { recursive: true });

function runNode(script) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script], {
      cwd: ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      const s = d.toString();
      stdout += s;
      process.stdout.write(s);
    });
    child.stderr.on("data", (d) => {
      const s = d.toString();
      stderr += s;
      process.stderr.write(s);
    });
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

async function main() {
  const startedAt = new Date().toISOString();
  if (!fs.existsSync(CHILD)) {
    const blocked = {
      gate3: "BLOCKED",
      reason: `Missing ${CHILD}`,
      startedAt,
    };
    fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(blocked, null, 2));
    console.log(JSON.stringify(blocked, null, 2));
    process.exit(2);
  }

  console.log("=== GATE 3 — broadcasting via scripts/cert-t3-t4-runtime.mjs ===\n");
  const result = await runNode(CHILD);

  const t3ReportPath = path.join(ROOT, "tmp", "t3-t4-runtime-cert", "report.json");
  let childReport = null;
  if (fs.existsSync(t3ReportPath)) {
    try {
      childReport = JSON.parse(fs.readFileSync(t3ReportPath, "utf8"));
    } catch {
      childReport = null;
    }
  }

  const harnessPass = result.code === 0 && childReport?.ok === true;
  const report = {
    gate3: harnessPass ? "PASS" : result.code === 2 ? "BLOCKED" : "FAIL",
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: result.code,
    childScript: "scripts/cert-t3-t4-runtime.mjs",
    childReportPath: t3ReportPath,
    childOk: childReport?.ok ?? false,
    certification: childReport?.certification ?? null,
    failedAt: childReport?.failedAt ?? null,
    physicalCertification: {
      status: "PENDING",
      required: [
        "Phone A: performer GO LIVE with real camera + mic",
        "Phone B / second browser: join same roomId and see/hear live media",
        "Confirm Lobby Wall / Home 3 surfaces the same room without fake viewers",
      ],
      note: "Harness PASS ≠ physical certification. Hardware WebRTC must still be phone-proven.",
    },
  };

  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  console.log("\n=== GATE 3 SUMMARY ===");
  console.log(JSON.stringify({ gate3: report.gate3, physical: report.physicalCertification.status }, null, 2));
  process.exit(harnessPass ? 0 : report.gate3 === "BLOCKED" ? 2 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
