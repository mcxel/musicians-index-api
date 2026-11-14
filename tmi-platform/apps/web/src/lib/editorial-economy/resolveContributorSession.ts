import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSessionDisplayName } from "@/lib/auth/resolveSessionIdentity";

export interface ContributorSessionIdentity {
  contributorId: string;
  displayName: string;
}

/**
 * Route-handler identity for the editorial-economy module — same cookie
 * contract as /api/auth/session and getTmiAuth() (tmi_session_id,
 * tmi_user_email), scoped to NextRequest since route handlers don't have
 * next/headers cookies(). contributorId is always the real, canonical
 * Prisma User id — never a client-supplied value (a client-sent
 * contributorId must never be trusted as identity).
 */
export async function resolveContributorSession(req: NextRequest): Promise<ContributorSessionIdentity | null> {
  const sessionId = req.cookies.get("tmi_session_id")?.value ?? "";
  const rawEmail = req.cookies.get("tmi_user_email")?.value ?? "";
  if (!sessionId && !rawEmail) return null;

  const user = await prisma.user
    .findFirst({
      where: {
        OR: [...(sessionId ? [{ id: sessionId }] : []), ...(rawEmail ? [{ email: rawEmail }] : [])],
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        name: true,
        userProfile: { select: { displayName: true } },
      },
    })
    .catch(() => null);

  if (!user) return null;

  return {
    contributorId: user.id,
    displayName: resolveSessionDisplayName({
      email: user.email ?? rawEmail,
      dbDisplayName: user.displayName ?? user.userProfile?.displayName,
      dbName: user.name,
      userId: user.id,
    }),
  };
}
