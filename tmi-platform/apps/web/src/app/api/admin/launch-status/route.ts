import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

function resolveFromCwd(candidates: string[]): string | null {
  for (const rel of candidates) {
    const candidate = path.resolve(process.cwd(), rel);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

type FinalLaunchGreenPassArtifact = {
  generatedAt?: string;
  checks?: {
    policy?: { green?: boolean };
    revenueRuntime?: { green?: boolean };
    launchTrust?: { green?: boolean };
  };
  allGreen?: boolean;
};

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const artifactPath = resolveFromCwd([
    path.join('artifacts', 'final_launch_green_pass.json'),
    path.join('..', 'artifacts', 'final_launch_green_pass.json'),
    path.join('..', '..', 'artifacts', 'final_launch_green_pass.json'),
  ]);
  const packageJsonPath = resolveFromCwd([
    path.join('package.json'),
    path.join('apps', 'web', 'package.json'),
  ]);

  let artifact: FinalLaunchGreenPassArtifact = {};
  if (artifactPath && existsSync(artifactPath)) {
    try {
      const raw = await readFile(artifactPath, 'utf8');
      artifact = JSON.parse(raw) as FinalLaunchGreenPassArtifact;
    } catch {
      artifact = {};
    }
  }

  let appVersion = 'unknown';
  if (packageJsonPath && existsSync(packageJsonPath)) {
    try {
      const raw = await readFile(packageJsonPath, 'utf8');
      const parsed = JSON.parse(raw) as { version?: string };
      appVersion = parsed.version ?? 'unknown';
    } catch {
      appVersion = 'unknown';
    }
  }

  const revenueGreen = artifact.checks?.revenueRuntime?.green === true;
  const policyGreen = artifact.checks?.policy?.green === true;
  const trustGreen = artifact.checks?.launchTrust?.green === true;
  const mobileGreen = policyGreen;
  const discoveryGreen = trustGreen;
  const operationsGreen = trustGreen;
  const experienceGreen = trustGreen;

  const overallGreen =
    revenueGreen &&
    discoveryGreen &&
    operationsGreen &&
    experienceGreen &&
    policyGreen &&
    mobileGreen &&
    artifact.allGreen === true;

  const commitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GIT_COMMIT_SHA ??
    process.env.SOURCE_VERSION ??
    'unknown';

  return NextResponse.json({
    status: {
      revenue: revenueGreen,
      discovery: discoveryGreen,
      operations: operationsGreen,
      experience: experienceGreen,
      policy: policyGreen,
      mobile: mobileGreen,
      overall: overallGreen,
    },
    lastCertification: artifact.generatedAt ?? null,
    currentBuild: commitSha,
    currentVersion: appVersion,
  });
}
