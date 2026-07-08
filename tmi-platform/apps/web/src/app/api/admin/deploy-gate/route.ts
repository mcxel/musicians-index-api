import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { getFleetSummary } from "@/lib/qa/QACertificationFleet";
import { getBigAceOperationsSnapshot } from "@/lib/ops/BigAceOperationsCenter";
import { getMCOperationsSnapshot } from "@/lib/ops/MCOperationsConsole";

export const dynamic = "force-dynamic";

type FinalLaunchGreenPassArtifact = {
  generatedAt?: string;
  checks?: {
    policy?: { green?: boolean };
    revenueRuntime?: { green?: boolean };
    launchTrust?: { green?: boolean };
  };
  allGreen?: boolean;
};

function resolveFromCwd(candidates: string[]): string | null {
  for (const rel of candidates) {
    const candidate = path.resolve(process.cwd(), rel);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function readLaunchArtifact(): Promise<FinalLaunchGreenPassArtifact> {
  const artifactPath = resolveFromCwd([
    path.join("artifacts", "final_launch_green_pass.json"),
    path.join("..", "artifacts", "final_launch_green_pass.json"),
    path.join("..", "..", "artifacts", "final_launch_green_pass.json"),
  ]);

  if (!artifactPath || !existsSync(artifactPath)) return {};

  try {
    const raw = await readFile(artifactPath, "utf8");
    return JSON.parse(raw) as FinalLaunchGreenPassArtifact;
  } catch {
    return {};
  }
}

function scoreByKey(fleet: ReturnType<typeof getFleetSummary>, key: string): number {
  return fleet.categories.find((c) => c.key === key)?.score ?? 0;
}

function categoryStatus(fleet: ReturnType<typeof getFleetSummary>, key: string) {
  const row = fleet.categories.find((c) => c.key === key);
  return {
    score: row?.score ?? 0,
    fail: row?.fail ?? 0,
    pending: row?.pending ?? 0,
  };
}

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const fleet = getFleetSummary();
  const artifact = await readLaunchArtifact();
  const bigAce = getBigAceOperationsSnapshot();
  const mc = getMCOperationsSnapshot();

  const runtimeScore = fleet.platformHealthScore;
  const paymentsScore = scoreByKey(fleet, "payments");
  const securityScore = scoreByKey(fleet, "security");
  const mediaScore = scoreByKey(fleet, "mediaUpload");
  const auth = categoryStatus(fleet, "authentication");
  const revenue = categoryStatus(fleet, "payments");
  const media = categoryStatus(fleet, "mediaUpload");
  const discovery = categoryStatus(fleet, "discovery");
  const admin = categoryStatus(fleet, "admin");

  const mandatoryFleets = {
    authenticationFleet: {
      label: "Authentication Fleet",
      pass: auth.fail === 0 && auth.pending === 0 && auth.score >= 99,
      metrics: auth,
    },
    revenueFleet: {
      label: "Revenue Fleet",
      pass: revenue.fail === 0 && revenue.pending === 0 && revenue.score >= 99,
      metrics: revenue,
    },
    mediaFleet: {
      label: "Media Fleet",
      pass: media.fail === 0 && media.pending === 0 && media.score >= 99,
      metrics: media,
    },
    discoveryFleet: {
      label: "Discovery Fleet",
      pass: discovery.fail === 0 && discovery.pending === 0 && discovery.score >= 99,
      metrics: discovery,
    },
    executiveFleet: {
      label: "Executive Fleet",
      pass: admin.fail === 0 && admin.pending === 0 && admin.score >= 99,
      metrics: admin,
    },
  };

  const missionApis = {
    certificationFleet: fleet.total > 0,
    launchStatusEvidence: artifact.allGreen === true,
    bigAceOperations: bigAce.companies.length >= 6,
    mcOperations: mc.queue.length > 0,
  };

  const checks = {
    runtime99: {
      label: "Runtime health >= 99",
      pass: runtimeScore >= 99,
      value: runtimeScore,
      expected: ">= 99",
    },
    revenueCritical100: {
      label: "Revenue critical path = 100",
      pass: paymentsScore >= 100,
      value: paymentsScore,
      expected: "= 100",
    },
    missionApisUp: {
      label: "Mission APIs operational",
      pass: Object.values(missionApis).every(Boolean),
      value: missionApis,
      expected: "all true",
    },
    securityGate: {
      label: "Security category >= 99",
      pass: securityScore >= 99,
      value: securityScore,
      expected: ">= 99",
    },
    mediaGate: {
      label: "Media category >= 99",
      pass: mediaScore >= 99,
      value: mediaScore,
      expected: ">= 99",
    },
    fleetGate: {
      label: "Fleet strict evidence gate",
      pass: fleet.releaseGate.strictEvidencePass,
      value: fleet.releaseGate,
      expected: "strictEvidencePass=true",
    },
    evidenceGate: {
      label: "Final launch artifact all green",
      pass: artifact.allGreen === true,
      value: {
        allGreen: artifact.allGreen === true,
        generatedAt: artifact.generatedAt ?? null,
        policy: artifact.checks?.policy?.green === true,
        revenueRuntime: artifact.checks?.revenueRuntime?.green === true,
        launchTrust: artifact.checks?.launchTrust?.green === true,
      },
      expected: "allGreen=true",
    },
  };

  const failed = Object.entries(checks)
    .filter(([, c]) => !c.pass)
    .map(([key, c]) => ({ key, label: c.label, expected: c.expected, value: c.value }));

  const blockedReasons = [
    !mandatoryFleets.authenticationFleet.pass ? "Authentication Certification incomplete" : null,
    !mandatoryFleets.revenueFleet.pass ? "Revenue Runtime evidence incomplete" : null,
    !mandatoryFleets.mediaFleet.pass ? "Media Certification failed" : null,
    !mandatoryFleets.discoveryFleet.pass ? "Discovery Certification incomplete" : null,
    !mandatoryFleets.executiveFleet.pass ? "Executive Certification incomplete" : null,
  ].filter((reason): reason is string => Boolean(reason));

  const deployAllowed = failed.length === 0 && blockedReasons.length === 0;

  return NextResponse.json({
    ok: true,
    deployAllowed,
    recommendation: deployAllowed ? "AUTO_DEPLOY" : "BLOCK",
    gateStatus: deployAllowed ? "DEPLOY=GO" : "DEPLOY=BLOCKED",
    blockedReasons,
    checkedAt: new Date().toISOString(),
    checks,
    mandatoryFleets,
    failed,
  });
}
