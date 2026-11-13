import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import {
  canonicalPublicPath,
  legacyPathForRole,
  publicKindFromDbRole,
  resolveRegistryPerformerByUsername,
} from "@/lib/identity/PublicProfileRuntime";
import PerformerPublicPage from "@/components/profile/PerformerPublicPage";
import FanPublicPage from "@/components/profile/FanPublicPage";
import WriterPublicPage from "@/components/writer/WriterPublicPage";
import { FanSponsorRegistry } from "@/lib/registries/FanSponsorRegistry";
import { getPerformerBySlug, type PerformerIdentity, type PerformerTier } from "@/lib/performers/PerformerRegistry";
import { getPublicProfileConfig, getProfileConfig } from "@/lib/profile/ProfileConfigService";
import { DEFAULT_PUBLIC_PROFILE_CONFIG, type PublicProfileConfig } from "@/lib/profile/PublicProfileStyleEngine";
import { getShareBaseUrl } from "@/lib/identity/ArtistShareIdentity";
import { readPublishedSocialDocument, readVisitorPublishedPresentation } from "@/lib/publicPage/publicPageRouteRead";
import { canonicalShareOrigin, composePublishedSocialCard, publishedSocialImagePath } from "@/lib/publicPage/publicPageSocialCard";

export const dynamic = "force-dynamic";

interface Props {
  params: { username: string };
  searchParams?: { tmiProfiles?: string; profileId?: string };
}

const SEED_FANS: Record<
  string,
  {
    id: string;
    displayName: string;
    name: string;
    role: string;
    tier: string;
    isLive: boolean;
    liveRoomId: string | null;
    userProfile: { username: string; avatarUrl: string; displayName: string; bio: string | null };
    artistProfile: null;
    userSettings: null;
  }
> = {
  "jasmine-r": {
    id: "fan-jasmine-r",
    displayName: "Jasmine R.",
    name: "Jasmine R.",
    role: "FAN",
    tier: "Diamond",
    isLive: false,
    liveRoomId: null,
    userProfile: {
      username: "jasmine-r",
      avatarUrl: "/bot-images/Bot image 2.png",
      displayName: "Jasmine R.",
      bio: null,
    },
    artistProfile: null,
    userSettings: null,
  },
};

function missingColumn(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === "P2022" || code === "P2021";
}

async function resolveDbUser(username: string) {
  const raw = username.trim();

  try {
    const found = await prisma.user.findFirst({
      where: {
        isQA: false,
        accountStatus: "active",
        OR: [
          { userProfile: { username: { equals: raw, mode: "insensitive" } } },
          { artistProfile: { slug: { equals: raw, mode: "insensitive" } } },
          { id: { startsWith: raw } },
          { displayName: { equals: raw, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        displayName: true,
        name: true,
        role: true,
        tier: true,
        isLive: true,
        liveRoomId: true,
        userSettings: { select: { profileVisibility: true, deletionRequestedAt: true } },
        userProfile: { select: { username: true, avatarUrl: true, displayName: true, bio: true } },
        artistProfile: { select: { slug: true, stageName: true } },
      },
    });
    if (found) return found;
  } catch (error) {
    if (!missingColumn(error)) throw error;
    const narrow = await prisma.user.findFirst({
      where: {
        OR: [
          { id: { startsWith: raw } },
          { name: { equals: raw, mode: "insensitive" } },
          { email: { equals: raw, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true, role: true },
    }).catch((narrowError: unknown) => {
      if (missingColumn(narrowError)) return null;
      throw narrowError;
    });
    if (narrow) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: narrow.id },
        select: { username: true, avatarUrl: true, displayName: true, bio: true },
      }).catch(() => null);
      const artistProfile = await prisma.artistProfile.findUnique({
        where: { userId: narrow.id },
        select: { slug: true, stageName: true },
      }).catch(() => null);
      return {
        id: narrow.id,
        displayName: narrow.name,
        name: narrow.name,
        role: String(narrow.role),
        tier: null as string | null,
        isLive: false,
        liveRoomId: null as string | null,
        userSettings: null,
        userProfile,
        artistProfile,
      };
    }
  }
  return SEED_FANS[raw.toLowerCase()] ?? null;
}

function accountTier(raw: string | null | undefined): PerformerTier {
  switch ((raw ?? "").toUpperCase()) {
    case "PRO": return "PRO";
    case "RUBY": return "RUBY";
    case "SILVER": return "Silver";
    case "GOLD": return "Gold";
    case "PLATINUM": return "Platinum";
    case "DIAMOND": return "Diamond";
    default: return "FREE";
  }
}

function performerFromAccount(
  account: NonNullable<Awaited<ReturnType<typeof resolveDbUser>>>,
  slug: string,
  displayName: string,
): PerformerIdentity {
  const photo = account.userProfile?.avatarUrl || "";
  return {
    id: account.id,
    slug,
    name: displayName,
    ownerId: account.id,
    profileImageUrl: photo,
    coverImageUrl: photo,
    bio: account.userProfile?.bio ?? undefined,
    city: "",
    countryName: "",
    flag: "",
    category: "Indie",
    tier: accountTier(account.tier),
    lineupType: "solo",
    rank: 0,
    xp: 0,
    fanCount: 0,
    likes: 0,
    isLive: false,
    audienceCount: 0,
    timeLive: "",
    roomId: "",
    achievementIds: [],
    profileRoute: canonicalPublicPath(slug),
    liveRoomRoute: "",
    articleIds: [],
    rankingEligible: false,
  };
}

export default async function CanonicalPublicProfilePage({ params, searchParams }: Props) {
  const username = decodeURIComponent(params.username);
  const discoverySuffix = searchParams?.tmiProfiles === "1" && searchParams.profileId === username
    ? `?tmiProfiles=1&profileId=${encodeURIComponent(username)}` : "";

  const viewer = await getTmiAuth();
  const dbUser = await resolveDbUser(username);

  const registryTarget = resolveRegistryPerformerByUsername(username);
  const registryPerformer = registryTarget ? getPerformerBySlug(registryTarget.username) : null;
  const ownedSlug = dbUser?.artistProfile?.slug ?? dbUser?.userProfile?.username ?? null;
  const registryOwnedByDbUser = Boolean(
    registryPerformer &&
    dbUser &&
    (ownedSlug === registryPerformer.slug || dbUser.id === registryPerformer.ownerId),
  );
  const registryAuthor =
    registryOwnedByDbUser &&
    dbUser != null &&
    publicKindFromDbRole(dbUser.role) === "performer";
  if (registryPerformer && !registryAuthor) {
    return <PerformerPublicPage performer={registryPerformer} />;
  }

  if (!dbUser) {
    notFound();
  }

  const isOwner = viewer?.user.id === dbUser.id;
  if (!isOwner) {
    if (dbUser.userSettings &&
        (dbUser.userSettings.profileVisibility !== "public" || dbUser.userSettings.deletionRequestedAt)) {
      notFound();
    }
    if (viewer) {
      const blocked = await prisma.friendship.count({ where: {
        status: "blocked",
        OR: [
          { requesterId: viewer.user.id, addresseeId: dbUser.id },
          { requesterId: dbUser.id, addresseeId: viewer.user.id },
        ],
      } }).catch((error: unknown) => {
        if (missingColumn(error)) return 0;
        throw error;
      });
      if (blocked) notFound();
    }
  }

  const visitorPage = await readVisitorPublishedPresentation({
    ownerUserId: dbUser.id,
    role: dbUser.role,
  });

  // Load public profile config — visitor sees published config or defaults
  let profileConfig: PublicProfileConfig | undefined;
  try {
    const dbCfg = await (isOwner ? getProfileConfig(dbUser.id) : getPublicProfileConfig(dbUser.id));
    profileConfig = {
      accentColor: dbCfg.themeColor,
      activeStylePackId: dbCfg.activeStylePackId,
      animationIntensity: dbCfg.animationIntensity,
      layout: dbCfg.layout,
      font: "INTER",
      visibleModules: dbCfg.visibleModules,
      statusMessage: dbCfg.statusMessage ?? null,
      pinnedItems: dbCfg.pinnedItems,
      published: dbCfg.published,
      // PAGE_WRITING now resolves live from canonical Content
      // (usePageWritingContent) inside the page components — never seed
      // this prop with the four hardcoded sample entries.
      personalWritings: [],
      soundtrack: DEFAULT_PUBLIC_PROFILE_CONFIG.soundtrack,
      hero: DEFAULT_PUBLIC_PROFILE_CONFIG.hero,
    };
  } catch {
    profileConfig = undefined; // pages fall back to DEFAULT_PUBLIC_PROFILE_CONFIG
  }

  const kind = publicKindFromDbRole(dbUser.role);
  const slug =
    dbUser.artistProfile?.slug ??
    dbUser.userProfile?.username ??
    dbUser.id.slice(0, 8);
  const displayName =
    dbUser.artistProfile?.stageName ??
    dbUser.userProfile?.displayName ??
    dbUser.displayName ??
    dbUser.name ??
    username;

  if (kind === "performer" || kind === "artist") {
    const performer = performerFromAccount(dbUser, slug, displayName);
    return <PerformerPublicPage performer={performer} isOwner={isOwner} ownerUserId={isOwner ? dbUser.id : undefined} profileUserId={dbUser.id} profileConfig={profileConfig} publishedPresentation={visitorPage.publishedPresentation} />;
  }

  if (kind === "fan") {
    // Real FanSponsorRegistry rows only — active + paid commitment; honest empty if none.
    const sponsors = await FanSponsorRegistry.listEligiblePublicPlacements(dbUser.id, slug).catch(
      () => [],
    );
    return (
      <FanPublicPage
        slug={slug}
        displayName={displayName}
        avatarUrl={dbUser.userProfile?.avatarUrl}
        tier={dbUser.tier?.toLowerCase() ?? "free"}
        userId={dbUser.id}
        isLive={dbUser.isLive}
        liveRoomRoute={dbUser.liveRoomId ? `/live/rooms/${dbUser.liveRoomId}` : null}
        isOwner={isOwner}
        profileConfig={profileConfig}
        publishedPresentation={visitorPage.publishedPresentation}
        sponsors={sponsors}
      />
    );
  }

  if (kind === "writer") {
    return (
      <WriterPublicPage
        slug={slug}
        displayName={displayName}
        userId={dbUser.id}
        isOwner={isOwner}
        publishedPresentation={visitorPage.publishedPresentation}
      />
    );
  }

  redirect(`${legacyPathForRole({ kind, username: slug, userId: dbUser.id })}${discoverySuffix}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = decodeURIComponent(params.username);
  const registry = resolveRegistryPerformerByUsername(username);
  const dbUser = await resolveDbUser(username);
  const privatePage = Boolean(
    dbUser?.userSettings &&
    (dbUser.userSettings.profileVisibility !== "public" || dbUser.userSettings.deletionRequestedAt),
  );
  const displayName = registry?.displayName
    ?? dbUser?.userProfile?.displayName
    ?? dbUser?.artistProfile?.stageName
    ?? dbUser?.displayName
    ?? dbUser?.name
    ?? username;
  const published = !privatePage && dbUser
    ? await readPublishedSocialDocument({ ownerUserId: dbUser.id, role: dbUser.role })
    : null;
  const card = composePublishedSocialCard({
    displayName: privatePage ? "TMI" : displayName,
    document: privatePage ? null : published?.document ?? null,
    revisionNumber: published?.revisionNumber ?? null,
  });
  const canonical = canonicalPublicPath(registry?.username ?? username);
  const origin = canonicalShareOrigin(getShareBaseUrl());
  const pageUrl = `${origin}${canonical}`;
  const imagePath = publishedSocialImagePath(registry?.username ?? username, card.revisionNumber);
  const imageUrl = `${origin}${imagePath}`;
  return {
    title: card.title,
    description: card.description,
    alternates: { canonical },
    openGraph: {
      title: card.title,
      description: card.description,
      url: pageUrl,
      type: "profile",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: card.displayName }],
    },
    twitter: {
      card: "summary_large_image",
      title: card.title,
      description: card.description,
      images: [imageUrl],
    },
    robots: privatePage ? { index: false, follow: false } : undefined,
  };
}
