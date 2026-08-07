/**
 * Rule 26 role provisioning — creates real Prisma rows only.
 * Never reports OK for resources that were not actually written.
 */

import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { seedAvatarIdentity } from "@/lib/avatars/seedAvatarIdentity";

export type ProvisionStepStatus = "OK" | "ERROR" | "SKIPPED";

export type ProvisionStep = {
  step: string;
  status: ProvisionStepStatus;
  error?: string;
  [key: string]: unknown;
};

export type ProvisionAccountType =
  | "FAN"
  | "PERFORMER"
  | "BAND"
  | "VENUE"
  | "PROMOTER"
  | "SPONSOR"
  | "ADVERTISER";

const ROLE_NORMALIZATION: Record<string, ProvisionAccountType> = {
  MEMBER: "FAN",
  ARTIST: "PERFORMER",
  USER: "FAN",
};

const VALID_ACCOUNT_TYPES = new Set<ProvisionAccountType>([
  "FAN",
  "PERFORMER",
  "BAND",
  "VENUE",
  "PROMOTER",
  "SPONSOR",
  "ADVERTISER",
]);

/** Map signup account type → Prisma Role enum */
const ACCOUNT_TO_PRISMA_ROLE: Record<ProvisionAccountType, Role> = {
  FAN: "FAN",
  PERFORMER: "PERFORMER",
  BAND: "BAND",
  VENUE: "VENUE",
  PROMOTER: "PROMOTER",
  SPONSOR: "SPONSOR",
  ADVERTISER: "ADVERTISER",
};

export function normalizeAccountType(
  roles?: string[],
  accountType?: string,
): ProvisionAccountType {
  const raw = (roles?.[0] ?? accountType ?? "FAN").toUpperCase();
  const normalized = ROLE_NORMALIZATION[raw] ?? raw;
  if (VALID_ACCOUNT_TYPES.has(normalized as ProvisionAccountType)) {
    return normalized as ProvisionAccountType;
  }
  return "FAN";
}

async function stepOk(
  name: string,
  fn: () => Promise<Record<string, unknown> | void>,
): Promise<ProvisionStep> {
  try {
    const extra = (await fn()) ?? {};
    return { step: name, status: "OK", ...extra };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { step: name, status: "ERROR", error: message };
  }
}

function stepSkipped(name: string, reason: string): ProvisionStep {
  return { step: name, status: "SKIPPED", error: reason };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "user";
}

async function provisionCommon(
  userId: string,
  accountType: ProvisionAccountType,
  displayName: string | null,
): Promise<ProvisionStep[]> {
  const starterPoints = accountType === "PERFORMER" || accountType === "BAND" ? 250 : 100;

  const profile = await stepOk("profile_created", async () => {
    const row = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: displayName ?? undefined,
        username: `${slugify(displayName ?? userId)}-${userId.slice(-6)}`,
      },
      update: {
        displayName: displayName ?? undefined,
      },
    });
    return { profileId: row.id };
  });

  const wallet = await stepOk("wallet_created", async () => {
    const row = await prisma.wallet.upsert({
      where: { userId },
      create: { userId, availableBalance: 0, pendingBalance: 0, fanCredits: 0 },
      update: {},
    });
    return { walletId: row.id };
  });

  const points = await stepOk("points_ledger_created", async () => {
    const existing = await prisma.ledgerEntry.findFirst({
      where: { userId, description: "Starter points", relatedId: `starter_${userId}` },
    });
    if (existing) return { starterPoints, ledgerEntryId: existing.id, reused: true };

    const entry = await prisma.ledgerEntry.create({
      data: {
        userId,
        type: "CREDIT",
        amount: starterPoints,
        description: "Starter points",
        relatedId: `starter_${userId}`,
      },
    });

    await prisma.wallet.update({
      where: { userId },
      data: { fanCredits: { increment: starterPoints } },
    });

    return { starterPoints, ledgerEntryId: entry.id };
  });

  const notifications = await stepOk("notification_settings", async () => {
    const defaults = [
      { type: "system", channel: "in_app" },
      { type: "tips", channel: "in_app" },
      { type: "marketing", channel: "email" },
    ];
    for (const d of defaults) {
      await prisma.notificationPreference.upsert({
        where: {
          userId_type_channel: { userId, type: d.type, channel: d.channel },
        },
        create: { userId, type: d.type, channel: d.channel, enabled: true },
        update: {},
      });
    }
    return { preferenceCount: defaults.length };
  });

  const settings = await stepOk("user_settings_created", async () => {
    const row = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    return { settingsId: row.id };
  });

  const roleSync = await stepOk("role_assigned", async () => {
    const prismaRole = ACCOUNT_TO_PRISMA_ROLE[accountType];
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: prismaRole,
        onboardingState: "INCOMPLETE",
      },
    });
    await prisma.userRole.upsert({
      where: { userId_role: { userId, role: prismaRole } },
      create: { userId, role: prismaRole },
      update: {},
    });
    return { role: prismaRole };
  });

  const bots = stepSkipped(
    "onboarding_bots_assigned",
    "Bot duty assignment deferred — no fabricated bot ops at provision",
  );

  return [profile, wallet, points, notifications, settings, roleSync, bots];
}

async function provisionFan(userId: string, displayName: string | null): Promise<ProvisionStep[]> {
  const fanProfile = await stepOk("fan_profile_created", async () => {
    const row = await prisma.fanProfile.upsert({
      where: { userId },
      create: { userId, favoriteGenres: [], bio: null },
      update: {},
    });
    return { fanProfileId: row.id };
  });

  const lobby = await stepOk("fan_live_lobby_access", async () => {
    const row = await prisma.lobby.upsert({
      where: { userId },
      create: { userId, tier: "FREE", theme: "default_theater", level: 1 },
      update: {},
    });
    return { lobbyId: row.id };
  });

  const playlist = await stepOk("personal_playlist_created", async () => {
    const existing = await prisma.playlist.findFirst({
      where: { creatorId: userId, name: "My Playlist" },
    });
    if (existing) return { playlistId: existing.id, playlistName: existing.name, reused: true };
    const row = await prisma.playlist.create({
      data: {
        creatorId: userId,
        name: "My Playlist",
        description: "Personal playlist",
        isPublic: false,
      },
    });
    return { playlistId: row.id, playlistName: row.name };
  });

  const canvas = await stepOk("yopho_fan_canvas_created", async () => {
    const existing = await prisma.memoryAlbum.findFirst({
      where: { ownerId: userId, presetKey: "YOPHO_FAN" },
    });
    if (existing) {
      return { albumId: existing.id, canvasType: "personal_scrapbook", reused: true };
    }
    const row = await prisma.memoryAlbum.create({
      data: {
        ownerId: userId,
        title: `${displayName ?? "Fan"} YoPho Canvas`,
        presetKey: "YOPHO_FAN",
        isDefault: false,
      },
    });
    return { albumId: row.id, canvasType: "personal_scrapbook" };
  });

  const avatar = await stepOk("avatar_identity_seeded", async () => {
    const identity = await seedAvatarIdentity(userId);
    return { avatarIdentityId: identity.id };
  });

  return [fanProfile, lobby, playlist, canvas, avatar];
}

async function provisionPerformerLike(
  userId: string,
  displayName: string | null,
  kind: "PERFORMER" | "BAND",
): Promise<ProvisionStep[]> {
  const baseSlug = slugify(displayName ?? userId);

  const artistProfile = await stepOk("artist_profile_created", async () => {
    const existing = await prisma.artistProfile.findUnique({ where: { userId } });
    if (existing) return { artistProfileId: existing.id, slug: existing.slug, reused: true };

    let slug = baseSlug;
    const clash = await prisma.artistProfile.findUnique({ where: { slug } });
    if (clash) slug = `${baseSlug}-${userId.slice(-6)}`;

    const row = await prisma.artistProfile.create({
      data: {
        userId,
        stageName: displayName ?? slug,
        slug,
        genres: [],
        skills: kind === "BAND" ? ["BAND"] : [],
      },
    });
    return { artistProfileId: row.id, slug: row.slug };
  });

  const artist = await stepOk("artist_record_created", async () => {
    const row = await prisma.artist.upsert({
      where: { userId },
      create: { userId, name: displayName ?? baseSlug },
      update: {},
    });
    return { artistId: row.id };
  });

  const mediaLocker = await stepOk("media_locker_created", async () => {
    const existing = await prisma.playlist.findFirst({
      where: { creatorId: userId, name: "Media Locker" },
    });
    if (existing) return { playlistId: existing.id, reused: true };
    const row = await prisma.playlist.create({
      data: {
        creatorId: userId,
        name: "Media Locker",
        description: "Performer media locker",
        isPublic: false,
      },
    });
    return { playlistId: row.id };
  });

  const canvas = await stepOk("performer_yopho_canvas_created", async () => {
    const presetKey = kind === "BAND" ? "YOPHO_BAND" : "YOPHO_PERFORMER";
    const existing = await prisma.memoryAlbum.findFirst({
      where: { ownerId: userId, presetKey },
    });
    if (existing) {
      return { albumId: existing.id, canvasType: "professional_portfolio", reused: true };
    }
    const row = await prisma.memoryAlbum.create({
      data: {
        ownerId: userId,
        title: `${displayName ?? "Artist"} Portfolio`,
        presetKey,
        isDefault: false,
      },
    });
    return { albumId: row.id, canvasType: "professional_portfolio" };
  });

  const beatLab = stepSkipped(
    "beat_lab_access_granted",
    "No BeatLab prisma model — access is role-gated at route level",
  );
  const nftLab = stepSkipped(
    "nft_lab_access_granted",
    "No NFT lab prisma model — access is role-gated at route level",
  );
  const booking = stepSkipped(
    "booking_workspace_created",
    "Performer booking uses BookingOffer/Request at request time — no empty workspace row",
  );

  return [artistProfile, artist, mediaLocker, canvas, beatLab, nftLab, booking];
}

async function provisionVenue(userId: string, displayName: string | null): Promise<ProvisionStep[]> {
  const venue = await stepOk("venue_profile_created", async () => {
    const existing = await prisma.venueProfile.findUnique({ where: { userId } });
    if (existing) return { venueProfileId: existing.id, reused: true };
    const row = await prisma.venueProfile.create({
      data: {
        userId,
        venueName: displayName ?? "New Venue",
        venueType: "CLUB",
        description: null,
        isActive: true,
      },
    });
    return { venueProfileId: row.id };
  });

  const booking = await stepOk("booking_workspace_created", async () => {
    const vp = await prisma.venueProfile.findUnique({ where: { userId } });
    if (!vp) throw new Error("venue_profile_required");
    const row = await prisma.bookingRules.upsert({
      where: { venueProfileId: vp.id },
      create: { venueProfileId: vp.id },
      update: {},
    });
    return { bookingRulesId: row.id };
  });

  const location = stepSkipped(
    "venue_location_created",
    "VenueLocation requires real coordinates — created when venue completes address",
  );

  return [venue, booking, location];
}

async function provisionPromoter(userId: string, displayName: string | null): Promise<ProvisionStep[]> {
  const promoter = await stepOk("promoter_profile_created", async () => {
    const row = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: displayName ?? "Promoter",
        username: `promoter-${userId.slice(-8)}`,
        bio: "Event promoter",
      },
      update: {
        displayName: displayName ?? undefined,
      },
    });
    return { profileId: row.id };
  });

  const tickets = stepSkipped(
    "ticket_management_created",
    "Ticket inventory is event-scoped (Rule 17) — no empty promoter ticket table at signup",
  );
  const calendar = stepSkipped(
    "event_calendar_created",
    "No promoter calendar prisma model — events created via Venue/Promoter event flow",
  );

  return [promoter, tickets, calendar];
}

async function provisionSponsor(userId: string, displayName: string | null): Promise<ProvisionStep[]> {
  const profile = await stepOk("sponsor_profile_created", async () => {
    const row = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: displayName ?? "Sponsor",
        username: `sponsor-${userId.slice(-8)}`,
        bio: "Brand sponsor",
      },
      update: {
        displayName: displayName ?? undefined,
      },
    });
    return { profileId: row.id };
  });

  const rewards = await stepOk("reward_workspace_created", async () => {
    const existing = await prisma.sponsorPrizeCatalog.findFirst({
      where: { sponsorId: userId, name: "Starter Reward Pool" },
    });
    if (existing) return { catalogId: existing.id, reused: true };
    const row = await prisma.sponsorPrizeCatalog.create({
      data: {
        sponsorId: userId,
        name: "Starter Reward Pool",
        description: "Add prizes when ready to distribute",
        totalQty: 0,
        remaining: 0,
        isActive: false,
      },
    });
    return { catalogId: row.id };
  });

  const campaign = stepSkipped(
    "campaign_workspace_created",
    "Sponsor campaigns attach to contests via SponsorContribution — no empty campaign row",
  );
  const inventory = stepSkipped(
    "inventory_bucket_created",
    "Covered by SponsorPrizeCatalog reward workspace",
  );
  const bots = stepSkipped(
    "sponsor_bots_assigned",
    "No fabricated sponsor bots at provision",
  );

  return [profile, rewards, campaign, inventory, bots];
}

async function provisionAdvertiser(userId: string, displayName: string | null): Promise<ProvisionStep[]> {
  const profile = await stepOk("advertiser_profile_created", async () => {
    const row = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: displayName ?? "Advertiser",
        username: `ad-${userId.slice(-8)}`,
        bio: "Advertiser account",
      },
      update: {
        displayName: displayName ?? undefined,
      },
    });
    return { profileId: row.id };
  });

  const creative = await stepOk("campaign_workspace_created", async () => {
    const existing = await prisma.adCreative.findFirst({
      where: { advertiserId: userId, name: "Draft Creative" },
    });
    if (existing) return { creativeId: existing.id, reused: true };
    const row = await prisma.adCreative.create({
      data: {
        advertiserId: userId,
        name: "Draft Creative",
        type: "BANNER",
        fileUrl: "",
        clickUrl: "/sponsors/advertise",
        altText: "Upload creative to activate",
        status: "pending",
      },
    });
    return { creativeId: row.id };
  });

  const billing = await stepOk("billing_profile_created", async () => {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("wallet_missing_for_billing");
    return { walletId: wallet.id };
  });

  const placements = stepSkipped(
    "placements_dashboard_created",
    "Placements are AdCampaign rows created when advertiser launches a campaign",
  );
  const bots = stepSkipped(
    "ad_ops_bots_assigned",
    "No fabricated ad-ops bots at provision",
  );

  return [profile, creative, billing, placements, bots];
}

export type ProvisionResult = {
  userId: string;
  accountType: ProvisionAccountType;
  completedAt: string;
  ok: boolean;
  steps: ProvisionStep[];
  error?: string;
};

export async function provisionRoleResources(
  userId: string,
  accountType: ProvisionAccountType,
): Promise<ProvisionResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, displayName: true, name: true, email: true },
  });
  if (!user) {
    return {
      userId,
      accountType,
      completedAt: new Date().toISOString(),
      ok: false,
      steps: [{ step: "user_lookup", status: "ERROR", error: "user_not_found" }],
      error: "user_not_found",
    };
  }

  const displayName = user.displayName ?? user.name ?? user.email?.split("@")[0] ?? null;
  const steps: ProvisionStep[] = [];

  steps.push(...(await provisionCommon(userId, accountType, displayName)));

  switch (accountType) {
    case "FAN":
      steps.push(...(await provisionFan(userId, displayName)));
      break;
    case "PERFORMER":
      steps.push(...(await provisionPerformerLike(userId, displayName, "PERFORMER")));
      break;
    case "BAND":
      steps.push(...(await provisionPerformerLike(userId, displayName, "BAND")));
      break;
    case "VENUE":
      steps.push(...(await provisionVenue(userId, displayName)));
      break;
    case "PROMOTER":
      steps.push(...(await provisionPromoter(userId, displayName)));
      break;
    case "SPONSOR":
      steps.push(...(await provisionSponsor(userId, displayName)));
      break;
    case "ADVERTISER":
      steps.push(...(await provisionAdvertiser(userId, displayName)));
      break;
  }

  const hardErrors = steps.filter((s) => s.status === "ERROR");
  const criticalFailed = hardErrors.some((s) =>
    [
      "profile_created",
      "wallet_created",
      "role_assigned",
      "fan_profile_created",
      "artist_profile_created",
      "venue_profile_created",
      "avatar_identity_seeded",
    ].includes(s.step),
  );

  return {
    userId,
    accountType,
    completedAt: new Date().toISOString(),
    ok: !criticalFailed,
    steps,
    error: criticalFailed
      ? hardErrors.map((s) => `${s.step}: ${s.error}`).join("; ")
      : undefined,
  };
}
