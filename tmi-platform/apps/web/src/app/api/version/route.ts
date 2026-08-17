import { NextResponse } from "next/server";

/**
 * Deployment identity for runtime-evidence probes (T1 certification gate).
 * VERCEL_GIT_COMMIT_SHA/_REF are Vercel's own System Environment Variables — the
 * authoritative source for "which commit is this deployment," no execSync guesswork.
 * force-dynamic: this must never get statically optimized/cached at build time, or
 * every deployment would keep serving the SHA baked in at the first build.
 * Returns "unknown" honestly when unset (e.g. local dev), per Rule 20.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_BUILD_SHA ?? "unknown";
  const branch = process.env.VERCEL_GIT_COMMIT_REF ?? "unknown";
  const deploymentEnv = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";
  const deploymentUrl = process.env.VERCEL_URL ?? "unknown";
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID ?? "unknown";
  const commitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE ?? "unknown";
  const headers = new Headers(request.headers);

  return NextResponse.json(
    {
      // Backward-compatible fields consumed by existing probes.
      sha,
      branch,
      env: deploymentEnv,
      deployedAt: deploymentEnv,
      // Extended identity for deployment forensics.
      deploymentEnv,
      deploymentUrl,
      deploymentId,
      commitMessage,
      host: headers.get("host") ?? "unknown",
      vercelRequestId: headers.get("x-vercel-id") ?? "unknown",
      identitySource:
        process.env.VERCEL_GIT_COMMIT_SHA && process.env.VERCEL_GIT_COMMIT_REF
          ? "vercel-system-env"
          : "fallback",
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
