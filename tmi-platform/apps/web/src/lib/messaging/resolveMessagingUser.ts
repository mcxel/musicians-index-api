/**
 * Resolve authenticated messaging user from real session (Prisma via getTmiAuth),
 * not the in-memory UserStore singleton — required for concurrent multi-user DMs.
 */

import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { resolveSessionDisplayName } from "@/lib/auth/resolveSessionIdentity";

export type MessagingUser = {
  id: string;
  email: string;
  displayName: string;
};

export async function resolveMessagingUser(
  _req?: NextRequest,
): Promise<MessagingUser | null> {
  const auth = await getTmiAuth();
  if (!auth?.user?.id) return null;

  let displayName = auth.user.name;
  let email = auth.user.email;

  try {
    const db = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        userProfile: { select: { displayName: true } },
      },
    });
    if (db) {
      email = db.email ?? email;
      displayName = resolveSessionDisplayName({
        email,
        dbDisplayName: db.displayName ?? db.userProfile?.displayName,
        userId: db.id,
      });
      return { id: db.id, email, displayName };
    }
  } catch {
    // fall through to session identity
  }

  return {
    id: auth.user.id,
    email,
    displayName: displayName || "Member",
  };
}

/**
 * Resolve a recipient handle to a real Prisma user id.
 * Accepts: user id, email, or displayName / username-like match.
 */
export async function resolveRecipientId(handle: string): Promise<{
  id: string;
  displayName: string;
  email: string | null;
} | null> {
  const raw = handle.trim();
  if (!raw) return null;

  // Exact id
  try {
    const byId = await prisma.user.findUnique({
      where: { id: raw },
      select: { id: true, displayName: true, email: true },
    });
    if (byId) {
      return {
        id: byId.id,
        displayName: byId.displayName ?? byId.email?.split("@")[0] ?? byId.id,
        email: byId.email,
      };
    }
  } catch {
    /* not a valid cuid / continue */
  }

  const lower = raw.toLowerCase();
  if (lower.includes("@")) {
    const byEmail = await prisma.user.findUnique({
      where: { email: lower },
      select: { id: true, displayName: true, email: true },
    });
    if (byEmail) {
      return {
        id: byEmail.id,
        displayName: byEmail.displayName ?? lower.split("@")[0]!,
        email: byEmail.email,
      };
    }
  }

  const byName = await prisma.user.findFirst({
    where: {
      OR: [
        { displayName: { equals: raw, mode: "insensitive" } },
        { email: { startsWith: lower, mode: "insensitive" } },
      ],
    },
    select: { id: true, displayName: true, email: true },
  });
  if (byName) {
    return {
      id: byName.id,
      displayName: byName.displayName ?? byName.email?.split("@")[0] ?? byName.id,
      email: byName.email,
    };
  }

  return null;
}
