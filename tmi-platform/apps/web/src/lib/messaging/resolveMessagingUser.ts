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
 * Accepts: user id, email, username, artist/venue slug, or displayName.
 */
export async function resolveRecipientId(handle: string): Promise<{
  id: string;
  displayName: string;
  email: string | null;
} | null> {
  const raw = handle.trim();
  if (!raw) return null;

  const toResult = (u: { id: string; displayName: string | null; email: string | null }) => ({
    id: u.id,
    displayName: u.displayName ?? u.email?.split("@")[0] ?? u.id,
    email: u.email,
  });

  // Exact id
  try {
    const byId = await prisma.user.findUnique({
      where: { id: raw },
      select: { id: true, displayName: true, email: true },
    });
    if (byId) return toResult(byId);
  } catch {
    /* not a valid cuid / continue */
  }

  const lower = raw.toLowerCase();
  if (lower.includes("@")) {
    const byEmail = await prisma.user.findUnique({
      where: { email: lower },
      select: { id: true, displayName: true, email: true },
    });
    if (byEmail) return toResult(byEmail);
  }

  // Artist profile slug (Message CTAs often pass performer slug)
  try {
    const artist = await prisma.artistProfile.findFirst({
      where: { slug: { equals: raw, mode: "insensitive" } },
      select: { user: { select: { id: true, displayName: true, email: true } }, stageName: true },
    });
    if (artist?.user) {
      return {
        id: artist.user.id,
        displayName:
          artist.stageName ??
          artist.user.displayName ??
          artist.user.email?.split("@")[0] ??
          artist.user.id,
        email: artist.user.email,
      };
    }
  } catch {
    /* continue */
  }

  // UserProfile username
  try {
    const profile = await prisma.userProfile.findFirst({
      where: { username: { equals: raw, mode: "insensitive" } },
      select: { user: { select: { id: true, displayName: true, email: true } }, displayName: true },
    });
    if (profile?.user) {
      return {
        id: profile.user.id,
        displayName: profile.displayName ?? profile.user.displayName ?? profile.user.id,
        email: profile.user.email,
      };
    }
  } catch {
    /* continue */
  }

  // Venue profile name match
  try {
    const venue = await prisma.venueProfile.findFirst({
      where: { venueName: { equals: raw, mode: "insensitive" } },
      select: { user: { select: { id: true, displayName: true, email: true } }, venueName: true },
    });
    if (venue?.user) {
      return {
        id: venue.user.id,
        displayName: venue.venueName || venue.user.displayName || venue.user.id,
        email: venue.user.email,
      };
    }
  } catch {
    /* continue */
  }

  const byName = await prisma.user.findFirst({
    where: {
      OR: [
        { displayName: { equals: raw, mode: "insensitive" } },
        { email: { startsWith: lower, mode: "insensitive" } },
        { name: { equals: raw, mode: "insensitive" } },
      ],
    },
    select: { id: true, displayName: true, email: true },
  });
  if (byName) return toResult(byName);

  return null;
}
