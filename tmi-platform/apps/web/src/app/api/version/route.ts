import { execSync } from "child_process";
import { NextResponse } from "next/server";

function getSha(): string {
  if (process.env.NEXT_PUBLIC_BUILD_SHA) return process.env.NEXT_PUBLIC_BUILD_SHA;
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["pipe", "pipe", "pipe"] })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    sha: getSha(),
    env: process.env.NODE_ENV ?? "unknown",
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? process.env.GIT_BRANCH ?? null,
    deployedAt: process.env.VERCEL_ENV ?? null,
  });
}
