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

export async function GET() {
  return NextResponse.json({
    sha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_BUILD_SHA ?? "unknown",
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
    commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? "unknown",
    deploymentEnv: process.env.VERCEL_ENV ?? "unknown",
    deploymentUrl: process.env.VERCEL_URL ?? "unknown",
  });
}
