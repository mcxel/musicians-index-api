export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { PERFORMER_REGISTRY } from '@/lib/performers/PerformerRegistry';
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';
import { magazineReaderArticleUrl } from '@/lib/magazine/MagazineReaderRoutes';
import { getAnchorDiscoveryRecords } from '@/lib/live/AnchorRoomNetwork';
import { getAllGenreDiscoveryRecords } from '@/lib/live/performerGenreRoomNetwork';
import { getActiveSessionsDurable } from '@/lib/broadcast/GlobalLiveSessionRegistry.server';
import { liveSessionToDiscoveryRecord } from '@/lib/discovery/DiscoveryPublisher';
import { canonicalPublicPath } from '@/lib/identity/PublicProfileRuntime';
import type { LiveDiscoveryRecord } from '@/lib/discovery/LiveDiscoveryRecord';

/**
 * Unified platform search — profiles, live rooms, articles, tracks.
 * CommandCenterTopNav → /search?q=… → this route.
 */

const PERFORMER_ROLES: Role[] = [Role.PERFORMER, Role.ARTIST, Role.BAND];

export type SearchResultKind = 'profile' | 'live_room' | 'article' | 'track';

export interface UnifiedSearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle?: string;
  href: string;
  imageUrl?: string | null;
  previewUrl?: string | null;
  audioUrl?: string | null;
  isLive?: boolean;
  viewerCount?: number;
  role?: string;
  verified?: boolean;
}

async function getRequesterRole(req: NextRequest): Promise<{ id: string; role: Role } | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  return user ? { id: user.id, role: user.role } : null;
}

function matchesQuery(text: string | null | undefined, q: string): boolean {
  if (!text || !q) return !q;
  return text.toLowerCase().includes(q.toLowerCase());
}

function searchRegistryPerformers(q: string): UnifiedSearchResult[] {
  return PERFORMER_REGISTRY.filter((p) => {
    if (!q) return true;
    return (
      matchesQuery(p.name, q) ||
      matchesQuery(p.slug, q) ||
      matchesQuery(p.category, q) ||
      matchesQuery(p.city, q)
    );
  }).slice(0, 15).map((p) => ({
    id: `registry-performer-${p.slug}`,
    kind: 'profile' as const,
    title: p.name,
    subtitle: [p.category, p.city].filter(Boolean).join(' · '),
    href: `/profile/performer/${p.slug}`,
    imageUrl: p.profileImageUrl,
    isLive: p.isLive,
    viewerCount: p.audienceCount,
    role: 'PERFORMER',
  }));
}

function searchTracks(q: string): UnifiedSearchResult[] {
  const out: UnifiedSearchResult[] = [];
  for (const p of PERFORMER_REGISTRY) {
    for (const song of p.songs ?? []) {
      if (q && !matchesQuery(song.title, q) && !matchesQuery(p.name, q)) continue;
      if (!song.audioUrl) continue;
      out.push({
        id: `track-${p.slug}-${song.title}`,
        kind: 'track',
        title: song.title,
        subtitle: p.name,
        href: `/profile/performer/${p.slug}`,
        imageUrl: song.coverUrl ?? p.profileImageUrl,
        audioUrl: song.audioUrl,
      });
      if (out.length >= 12) return out;
    }
  }
  return out;
}

function searchArticles(q: string): UnifiedSearchResult[] {
  return MAGAZINE_ISSUE_1.filter((a) => {
    if (!q) return true;
    return (
      matchesQuery(a.title, q) ||
      matchesQuery(a.subtitle, q) ||
      a.tags.some((t) => matchesQuery(t, q))
    );
  }).slice(0, 10).map((a) => ({
    id: `article-${a.slug}`,
    kind: 'article' as const,
    title: a.title,
    subtitle: a.subtitle,
    href: a.performerSlug
      ? `/articles/performer/${a.performerSlug}`
      : a.newsSlug
        ? `/articles/news/${a.newsSlug}`
        : magazineReaderArticleUrl(a.slug),
    imageUrl: null,
  }));
}

async function searchLiveRooms(q: string): Promise<UnifiedSearchResult[]> {
  const byId = new Map<string, LiveDiscoveryRecord>();
  for (const anchor of [...getAnchorDiscoveryRecords(), ...getAllGenreDiscoveryRecords()]) {
    byId.set(anchor.id, anchor);
  }
  try {
    const sessions = await getActiveSessionsDurable();
    for (const session of sessions) {
      const rec = liveSessionToDiscoveryRecord(session);
      if (rec) byId.set(rec.id, rec);
    }
  } catch {
    /* anchors still searchable */
  }

  return [...byId.values()]
    .filter((r) => {
      if (!q) return r.isLive || r.isAnchor;
      return (
        matchesQuery(r.title, q) ||
        matchesQuery(r.hostName, q) ||
        matchesQuery(r.category, q)
      );
    })
    .sort((a, b) => {
      if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
      return b.humanViewerCount - a.humanViewerCount;
    })
    .slice(0, 12)
    .map((r) => ({
      id: `room-${r.id}`,
      kind: 'live_room' as const,
      title: r.title,
      subtitle: r.hostName,
      href: r.joinRoute,
      imageUrl: r.posterUrl,
      previewUrl: r.previewUrl,
      isLive: r.isLive,
      viewerCount: r.humanViewerCount,
    }));
}

async function searchProfiles(q: string, type: 'performers' | 'fans'): Promise<UnifiedSearchResult[]> {
  const roleFilter: Role[] = type === 'fans' ? [Role.FAN] : PERFORMER_ROLES;

  const users = await prisma.user.findMany({
    where: {
      isQA: false,
      role: { in: roleFilter },
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
              { artistProfile: { stageName: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      role: true,
      tier: true,
      isLive: true,
        userProfile: { select: { avatarUrl: true, location: true, username: true } },
      artistProfile: { select: { slug: true, stageName: true, genres: true, verified: true, followers: true } },
    },
    take: 20,
    orderBy: q ? undefined : { lastSeenAt: 'desc' },
  });

  return users.map((u) => {
    const name = u.artistProfile?.stageName ?? u.displayName ?? u.name ?? 'TMI Member';
    const slug = u.artistProfile?.slug ?? u.userProfile?.username ?? u.id.slice(0, 8);
    const profileRoute = canonicalPublicPath(slug);
    return {
      id: u.id,
      kind: 'profile' as const,
      title: name,
      subtitle: u.userProfile?.location ?? u.tier,
      href: profileRoute,
      imageUrl: u.userProfile?.avatarUrl ?? null,
      isLive: u.isLive,
      role: u.role,
      verified: u.artistProfile?.verified ?? false,
    };
  });
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  const type = req.nextUrl.searchParams.get('type') === 'fans' ? 'fans' : 'performers';
  const scope = req.nextUrl.searchParams.get('scope') ?? 'all';

  if (type === 'fans') {
    const requester = await getRequesterRole(req);
    if (!requester || requester.role !== Role.FAN) {
      return NextResponse.json({ results: [], grouped: {}, error: 'Fan search requires a signed-in fan account' }, { status: 403 });
    }
  }

  if (scope === 'profiles') {
    const results = await searchProfiles(q, type);
    return NextResponse.json({ results, query: q, type });
  }

  const [dbProfiles, registryProfiles, liveRooms, articles, tracks] = await Promise.all([
    searchProfiles(q, type),
    Promise.resolve(type === 'performers' ? searchRegistryPerformers(q) : []),
    searchLiveRooms(q),
    Promise.resolve(searchArticles(q)),
    Promise.resolve(type === 'performers' ? searchTracks(q) : []),
  ]);

  const seenProfile = new Set<string>();
  const profiles: UnifiedSearchResult[] = [];
  for (const r of [...dbProfiles, ...registryProfiles]) {
    const key = r.href;
    if (seenProfile.has(key)) continue;
    seenProfile.add(key);
    profiles.push(r);
  }

  const grouped = {
    profiles,
    liveRooms,
    articles,
    tracks,
  };

  const results = [...liveRooms, ...profiles, ...tracks, ...articles];

  return NextResponse.json({ results, grouped, query: q, type });
}
