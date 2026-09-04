import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import {
  canonicalPublicPath,
  legacyPathForRole,
  publicKindFromDbRole,
  resolveRegistryPerformerByUsername,
} from "@/lib/identity/PublicProfileRuntime";
import PerformerPublicPage from "@/components/profile/PerformerPublicPage";
import FanPublicPage from "@/components/profile/FanPublicPage";
import { getPerformerBySlug } from "@/lib/performers/PerformerRegistry";
import { getPublicProfileConfig, getProfileConfig } from "@/lib/profile/ProfileConfigService";
import type { PublicProfileConfig } from "@/lib/profile/PublicProfileStyleEngine";

export const dynamic = "force-dynamic";

interface Props {
  params: { username: string };
}

async function resolveDbUser(username: string) {
  const raw = username.trim();

  return prisma.user.findFirst({
    where: {
      isQA: false,
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
      userProfile: { select: { username: true, avatarUrl: true, displayName: true } },
      artistProfile: { select: { slug: true, stageName: true } },
    },
  }).catch(() => null);
}

export default async function CanonicalPublicProfilePage({ params }: Props) {
  const username = decodeURIComponent(params.username);

  // Identify the authenticated viewer (never trust client — read cookie only)
  const cookieStore = cookies();
  const viewerEmail = cookieStore.get("tmi_user_email")?.value ?? null;
  const viewerUser = viewerEmail
    ? await prisma.user.findUnique({ where: { email: viewerEmail }, select: { id: true } }).catch(() => null)
    : null;

  const registryTarget = resolveRegistryPerformerByUsername(username);
  if (registryTarget) {
    const performer = getPerformerBySlug(registryTarget.username);
    if (performer) {
      return <PerformerPublicPage performer={performer} />;
    }
  }

  const dbUser = await resolveDbUser(username);
  if (!dbUser) {
    notFound();
  }

  const isOwner = viewerUser?.id === dbUser.id;

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
    const registryPerformer = getPerformerBySlug(slug);
    if (registryPerformer) {
      return <PerformerPublicPage performer={registryPerformer} isOwner={isOwner} profileConfig={profileConfig} />;
    }
    redirect(legacyPathForRole({ kind, username: slug, artistSlug: slug, userId: dbUser.id }));
  }

  if (kind === "fan") {
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
      />
    );
  }

  redirect(legacyPathForRole({ kind, username: slug, userId: dbUser.id }));
}

export async function generateMetadata({ params }: Props) {
  const username = decodeURIComponent(params.username);
  const registry = resolveRegistryPerformerByUsername(username);
  if (registry) {
    return {
      title: `${registry.displayName} | TMI`,
      alternates: { canonical: canonicalPublicPath(registry.username) },
    };
  }
  return {
    title: `${username} | TMI`,
    alternates: { canonical: canonicalPublicPath(username) },
  };
}
