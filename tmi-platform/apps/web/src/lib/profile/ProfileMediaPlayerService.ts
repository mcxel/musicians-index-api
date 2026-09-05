/**
 * ProfileMediaPlayerService — resolves active vs profile showcase chassis.
 * Uses existing Prisma fields: MediaPlayerPreference.equippedChassisId + UserProfile.socialLinks._tmiMediaPlayer
 *
 * Migrated off the legacy hash-family-ID display layer (MediaPlayerFamilyRegistry)
 * onto the real, live, commerce-wired MEDIA_PLAYER_CHASSIS_REGISTRY / ownership
 * authority (MediaPlayerOwnershipService). The family-ID layer's EQUIP_ACTIVE /
 * EQUIP_PROFILE commands were unreachable in production (every family entry was
 * STUB, so the certification gate rejected every equip attempt) — this migration
 * both removes the dead layer and makes those commands actually work.
 */

import prisma from "@/lib/prisma";
import { getMediaPlayerOwnership, equipChassisDb } from "@/lib/artifacts/MediaPlayerOwnershipService";
import {
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  FREE_DEFAULT_CHASSIS_ID,
  canEquipChassis,
  type MediaPlayerChassis,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import type { ProfileMediaPlayerCommand } from "@/lib/auth/profileMediaPlayerSecurity";

export interface ProfileMediaPlayerPrefs {
  activeChassisId: MediaPlayerChassisId;
  profileChassisId: MediaPlayerChassisId | null;
  followActivePlayer: boolean;
  displayChassisId: MediaPlayerChassisId;
  chassis: MediaPlayerChassis;
}

type SocialLinksMediaPlayer = {
  _tmiMediaPlayer?: {
    profileChassisId?: string | null;
    followActive?: boolean;
  };
};

function isChassisId(id: string | null | undefined): id is MediaPlayerChassisId {
  return Boolean(id) && (id as string) in MEDIA_PLAYER_CHASSIS_REGISTRY;
}

async function readProfilePrefs(userId: string): Promise<{
  profileChassisId: MediaPlayerChassisId | null;
  followActive: boolean;
}> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { socialLinks: true },
  });
  const links = (profile?.socialLinks ?? {}) as SocialLinksMediaPlayer;
  const mp = links._tmiMediaPlayer;
  const rawId = mp?.profileChassisId ?? null;
  const profileChassisId = isChassisId(rawId) ? rawId : null;
  const followActive = mp?.followActive !== false && profileChassisId == null;
  return { profileChassisId, followActive: followActive || profileChassisId == null };
}

async function writeProfilePrefs(
  userId: string,
  patch: Partial<{ profileChassisId: MediaPlayerChassisId | null; followActive: boolean }>,
): Promise<void> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { socialLinks: true },
  });
  const links = { ...((profile?.socialLinks ?? {}) as SocialLinksMediaPlayer) };
  const prev = links._tmiMediaPlayer ?? {};
  links._tmiMediaPlayer = {
    profileChassisId:
      patch.profileChassisId !== undefined ? patch.profileChassisId : (prev.profileChassisId ?? null),
    followActive: patch.followActive !== undefined ? patch.followActive : (prev.followActive ?? true),
  };
  await prisma.userProfile.upsert({
    where: { userId },
    create: { userId, socialLinks: links as object },
    update: { socialLinks: links as object },
  });
}

export async function resolveProfileMediaPlayerPresentation(
  ownerUserId: string,
): Promise<ProfileMediaPlayerPrefs> {
  const [ownership, prefs] = await Promise.all([
    getMediaPlayerOwnership(ownerUserId),
    readProfilePrefs(ownerUserId),
  ]);

  const activeChassisId = ownership.equippedChassisId;
  const followActivePlayer = prefs.profileChassisId == null || prefs.followActive;
  const resolvedDisplayId = followActivePlayer
    ? activeChassisId
    : (prefs.profileChassisId ?? activeChassisId);
  const displayChassisId = isChassisId(resolvedDisplayId) ? resolvedDisplayId : FREE_DEFAULT_CHASSIS_ID;
  const chassis = MEDIA_PLAYER_CHASSIS_REGISTRY[displayChassisId];

  return {
    activeChassisId,
    profileChassisId: prefs.profileChassisId,
    followActivePlayer,
    displayChassisId,
    chassis,
  };
}

export async function resolveOwnerUserIdBySlug(slug: string): Promise<string | null> {
  const key = slug.trim().toLowerCase();
  if (!key) return null;
  const artist = await prisma.artistProfile.findFirst({
    where: { slug: key },
    select: { userId: true },
  });
  if (artist?.userId) return artist.userId;
  const userProfile = await prisma.userProfile.findFirst({
    where: { username: key },
    select: { userId: true },
  });
  return userProfile?.userId ?? null;
}

export async function executeProfileMediaPlayerCommand(input: {
  ownerUserId: string;
  command: ProfileMediaPlayerCommand;
  chassisId?: string | null;
  tier: string;
}): Promise<{ ok: true; state: ProfileMediaPlayerPrefs } | { ok: false; error: string }> {
  const rawChassisId = input.chassisId?.trim() || null;

  if (input.command === "FOLLOW_ACTIVE") {
    await writeProfilePrefs(input.ownerUserId, { profileChassisId: null, followActive: true });
    const state = await resolveProfileMediaPlayerPresentation(input.ownerUserId);
    return { ok: true, state };
  }

  if (input.command === "EQUIP_ACTIVE") {
    if (!isChassisId(rawChassisId)) {
      return { ok: false, error: "Valid chassisId required for EQUIP_ACTIVE." };
    }
    const equip = await equipChassisDb(
      input.ownerUserId,
      rawChassisId,
      input.tier as "FREE" | "PRO" | "RUBY" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND",
    );
    if (!equip.ok) {
      return { ok: false, error: equip.error ?? "Equip failed." };
    }
    const state = await resolveProfileMediaPlayerPresentation(input.ownerUserId);
    return { ok: true, state };
  }

  if (input.command === "EQUIP_PROFILE") {
    if (rawChassisId) {
      if (!isChassisId(rawChassisId)) {
        return { ok: false, error: "Unknown chassis." };
      }
      // Same ownership/tier truth as EQUIP_ACTIVE — a profile showcase must
      // never display a chassis the owner hasn't actually unlocked.
      const ownership = await getMediaPlayerOwnership(input.ownerUserId);
      const owns = canEquipChassis(
        rawChassisId,
        input.tier as "FREE" | "PRO" | "RUBY" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND",
        ownership.ownedChassisIds,
      );
      if (!owns) {
        return { ok: false, error: "Chassis not owned or not unlocked for your tier." };
      }
      await writeProfilePrefs(input.ownerUserId, {
        profileChassisId: rawChassisId,
        followActive: false,
      });
    } else {
      await writeProfilePrefs(input.ownerUserId, { profileChassisId: null, followActive: false });
    }
    const state = await resolveProfileMediaPlayerPresentation(input.ownerUserId);
    return { ok: true, state };
  }

  return { ok: false, error: "Unknown command." };
}

/** Public-safe payload — no entitlement bypass, no internal owner ids when anonymous. */
export function toPublicMediaPlayerPayload(state: ProfileMediaPlayerPrefs) {
  return {
    displayChassisId: state.displayChassisId,
    followActivePlayer: state.followActivePlayer,
    chassisLabel: state.chassis.label,
    chassisIcon: state.chassis.icon,
    theme: state.chassis.theme,
    accent: state.chassis.accent,
  };
}
