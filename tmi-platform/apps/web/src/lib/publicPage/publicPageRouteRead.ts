/**
 * Server read of a published Public Page for /p/[username].
 * Missing tables or a failed lookup fall back to the legacy profile path.
 * This module does not create drafts and does not write config or content.
 */

import prisma from "@/lib/prisma";
import { createPrismaPublicPageStore } from "./publicPagePrismaStore";
import { createPublicPagePersistence } from "./publicPagePersistence";
import type { PublicPageDocument } from "./publicPageDocument";
import {
  hydrateVisitorPublishedPage,
  profileKindForPublicRole,
  type VisitorHydration,
} from "./publicPageRouteHydration";

export async function readVisitorPublishedPresentation(input: {
  ownerUserId: string;
  role: string;
}): Promise<VisitorHydration> {
  const profileKind = profileKindForPublicRole(input.role);
  if (!profileKind) return hydrateVisitorPublishedPage({ published: null, role: input.role });
  try {
    const persistence = createPublicPagePersistence(
      createPrismaPublicPageStore(prisma),
      () => "public-page-route-read",
    );
    const published = await persistence.getPublishedPage({
      ownerUserId: input.ownerUserId,
      profileKind,
      visitorMayRead: true,
    });
    return hydrateVisitorPublishedPage({ published, role: input.role });
  } catch {
    return hydrateVisitorPublishedPage({ published: null, role: input.role });
  }
}

export async function findPublishedPageOwner(username: string): Promise<{
  id: string;
  role: string;
  displayName: string;
  privatePage: boolean;
} | null> {
  const raw = username.trim();
  if (!raw) return null;
  try {
    const found = await prisma.user.findFirst({
      where: {
        OR: [
          { userProfile: { username: { equals: raw, mode: "insensitive" } } },
          { name: { equals: raw, mode: "insensitive" } },
          { displayName: { equals: raw, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        role: true,
        displayName: true,
        name: true,
        userSettings: { select: { profileVisibility: true, deletionRequestedAt: true } },
        userProfile: { select: { displayName: true } },
        artistProfile: { select: { stageName: true } },
      },
    });
    if (!found) return null;
    return {
      id: found.id,
      role: String(found.role),
      privatePage: Boolean(
        found.userSettings &&
        (found.userSettings.profileVisibility !== "public" || found.userSettings.deletionRequestedAt),
      ),
      displayName: found.userProfile?.displayName || found.artistProfile?.stageName || found.displayName || found.name || raw,
    };
  } catch {
    return null;
  }
}

/** Published revision only. Drafts are never read here. */
export async function readPublishedSocialDocument(input: {
  ownerUserId: string;
  role: string;
}): Promise<{ document: PublicPageDocument; revisionNumber: number } | null> {
  const profileKind = profileKindForPublicRole(input.role);
  if (!profileKind) return null;
  try {
    const persistence = createPublicPagePersistence(
      createPrismaPublicPageStore(prisma),
      () => "public-page-social-read",
    );
    const published = await persistence.getPublishedPage({
      ownerUserId: input.ownerUserId,
      profileKind,
      visitorMayRead: true,
    });
    if (!published.ok || published.mode !== "PUBLISHED") return null;
    return { document: published.document, revisionNumber: published.revisionNumber };
  } catch {
    return null;
  }
}
