/**
 * PublicSnipsCatalogCore — browser-safe Snips cache/index (no Prisma / pg).
 * Durable Video publish/hydrate: VideoSnipDurableAuthority + PublicSnipsCatalogAuthority.
 */

import { PERFORMER_REGISTRY, type PerformerIdentity } from "@/lib/performers/PerformerRegistry";

export type PublicSnipStatus = "PUBLIC" | "REMOVED" | "MODERATED" | "MEDIA_UNAVAILABLE";

export type PublicSnipRecord = {
  snipId: string;
  title: string;
  caption?: string;
  tags: string[];
  creatorId: string;
  creatorDisplayName: string;
  creatorSlug?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  /** Canonical successful publication time (ms). */
  publishedAt: number;
  status: PublicSnipStatus;
  destinationHref: string;
};

export type SnipsFeedPage = {
  items: PublicSnipRecord[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type SnipsSearchHit = PublicSnipRecord & {
  relevance: number;
  matchField: "title" | "caption" | "tag" | "creator";
};

const g = globalThis as typeof globalThis & {
  __tmiPublicSnipsCatalog?: Map<string, PublicSnipRecord>;
  __tmiPublicSnipsBootstrapped?: boolean;
};

function catalog(): Map<string, PublicSnipRecord> {
  if (!g.__tmiPublicSnipsCatalog) g.__tmiPublicSnipsCatalog = new Map();
  return g.__tmiPublicSnipsCatalog;
}

/** Stable faux publish time from slug so bootstrap order is deterministic. */
function bootstrapPublishedAt(slug: string, index: number): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return 1_700_000_000_000 + (h % 50_000_000) + index * 1_000;
}

function performerToRecord(p: PerformerIdentity, index: number): PublicSnipRecord | null {
  const videoUrl = p.introVideoUrl ?? p.motionPosterUrl ?? p.coverImageUrl ?? p.profileImageUrl;
  if (!videoUrl) return null;
  return {
    snipId: `snip-performer-${p.slug}`,
    title: p.name,
    caption: p.bio?.slice(0, 160),
    tags: [String(p.category).toLowerCase()].filter(Boolean),
    creatorId: p.id ?? p.slug,
    creatorDisplayName: p.name,
    creatorSlug: p.slug,
    videoUrl,
    thumbnailUrl: p.profileImageUrl,
    publishedAt: bootstrapPublishedAt(p.slug, index),
    status: "PUBLIC",
    destinationHref: `/performers/${p.slug}`,
  };
}

/** Seed cache from PerformerRegistry once — durable Video rows replace via hydrate. */
export function ensurePublicSnipsCatalogBootstrapped(): void {
  if (g.__tmiPublicSnipsBootstrapped) return;
  const map = catalog();
  PERFORMER_REGISTRY.forEach((p, i) => {
    const rec = performerToRecord(p, i);
    if (rec && !map.has(rec.snipId)) map.set(rec.snipId, rec);
  });
  g.__tmiPublicSnipsBootstrapped = true;
}

export const SNIP_TTL = null as null;

/** Cache upsert only — NOT durable publication. */
export function upsertPublicSnipCache(record: PublicSnipRecord): PublicSnipRecord {
  ensurePublicSnipsCatalogBootstrapped();
  catalog().set(record.snipId, record);
  return record;
}

/**
 * @deprecated Prefer publishPublicSnipDurable for permanent public success.
 * Kept as cache upsert for unit tests and post-durable sync.
 */
export function publishPublicSnip(input: {
  snipId: string;
  title: string;
  caption?: string;
  tags?: string[];
  creatorId: string;
  creatorDisplayName: string;
  creatorSlug?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  publishedAt?: number;
  destinationHref?: string;
}): PublicSnipRecord {
  const publishedAt = input.publishedAt ?? Date.now();
  const record: PublicSnipRecord = {
    snipId: input.snipId,
    title: input.title,
    caption: input.caption,
    tags: (input.tags ?? []).map((t) => t.toLowerCase()),
    creatorId: input.creatorId,
    creatorDisplayName: input.creatorDisplayName,
    creatorSlug: input.creatorSlug,
    videoUrl: input.videoUrl,
    thumbnailUrl: input.thumbnailUrl,
    publishedAt,
    status: "PUBLIC",
    destinationHref: input.destinationHref ?? `/p/${input.creatorSlug ?? input.creatorId}`,
  };
  return upsertPublicSnipCache(record);
}

/** Cache-only remove — does not change Video. Prefer removePublicSnipDurable. */
export function removePublicSnip(
  snipId: string,
  reason: "CREATOR_DELETE" | "MEDIA_REMOVED" | "MODERATION" | "SAFETY" = "CREATOR_DELETE",
): boolean {
  const map = catalog();
  const existing = map.get(snipId);
  if (!existing) return false;
  const status: PublicSnipStatus =
    reason === "MEDIA_REMOVED"
      ? "MEDIA_UNAVAILABLE"
      : reason === "MODERATION" || reason === "SAFETY"
        ? "MODERATED"
        : "REMOVED";
  map.set(snipId, { ...existing, status });
  return true;
}

function isEligiblePublic(rec: PublicSnipRecord): boolean {
  return rec.status === "PUBLIC" && Boolean(rec.videoUrl);
}

function compareNewestFirst(a: PublicSnipRecord, b: PublicSnipRecord): number {
  if (b.publishedAt !== a.publishedAt) return b.publishedAt - a.publishedAt;
  return a.snipId < b.snipId ? -1 : a.snipId > b.snipId ? 1 : 0;
}

export function listPublicSnipsNewestFirst(): PublicSnipRecord[] {
  ensurePublicSnipsCatalogBootstrapped();
  return [...catalog().values()].filter(isEligiblePublic).sort(compareNewestFirst);
}

export function pagePublicSnipsNewestFirst(opts?: {
  limit?: number;
  cursor?: string | null;
}): SnipsFeedPage {
  const limit = Math.max(1, Math.min(opts?.limit ?? 20, 50));
  const all = listPublicSnipsNewestFirst();
  let start = 0;
  if (opts?.cursor) {
    const [tsRaw, ...idParts] = opts.cursor.split(":");
    const ts = Number(tsRaw);
    const id = idParts.join(":");
    const idx = all.findIndex((r) => r.publishedAt === ts && r.snipId === id);
    start = idx >= 0 ? idx + 1 : 0;
  }
  const slice = all.slice(start, start + limit);
  const last = slice[slice.length - 1];
  const hasMore = start + slice.length < all.length;
  return {
    items: slice,
    nextCursor: hasMore && last ? `${last.publishedAt}:${last.snipId}` : null,
    hasMore,
  };
}

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function searchPublicSnips(
  query: string,
  opts?: { limit?: number },
): SnipsSearchHit[] {
  ensurePublicSnipsCatalogBootstrapped();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = tokenize(q);
  const limit = Math.max(1, Math.min(opts?.limit ?? 40, 100));
  const hits: SnipsSearchHit[] = [];

  for (const rec of catalog().values()) {
    if (!isEligiblePublic(rec)) continue;
    const title = rec.title.toLowerCase();
    const caption = (rec.caption ?? "").toLowerCase();
    const creator = rec.creatorDisplayName.toLowerCase();
    const slug = (rec.creatorSlug ?? "").toLowerCase();

    let relevance = 0;
    let matchField: SnipsSearchHit["matchField"] = "title";

    if (title === q) {
      relevance = 1000;
      matchField = "title";
    } else if (title.includes(q)) {
      relevance = 800;
      matchField = "title";
    } else if (tokens.every((t) => title.includes(t))) {
      relevance = 700;
      matchField = "title";
    } else if (caption.includes(q) || tokens.every((t) => caption.includes(t))) {
      relevance = 500;
      matchField = "caption";
    } else if (rec.tags.some((tag) => tag.includes(q) || tokens.includes(tag))) {
      relevance = 400;
      matchField = "tag";
    } else if (creator.includes(q) || slug.includes(q) || tokens.every((t) => creator.includes(t))) {
      relevance = 300;
      matchField = "creator";
    } else {
      continue;
    }

    relevance += Math.min(50, Math.floor(rec.publishedAt / 1e12));
    hits.push({ ...rec, relevance, matchField });
  }

  hits.sort((a, b) => {
    if (b.relevance !== a.relevance) return b.relevance - a.relevance;
    return compareNewestFirst(a, b);
  });

  return hits.slice(0, limit);
}

export function getPublicSnipById(snipId: string): PublicSnipRecord | null {
  ensurePublicSnipsCatalogBootstrapped();
  const rec = catalog().get(snipId);
  if (!rec || !isEligiblePublic(rec)) return null;
  return rec;
}

export function resetPublicSnipsCatalogForTests(rebootstrap = false): void {
  g.__tmiPublicSnipsCatalog = new Map();
  if (rebootstrap) {
    g.__tmiPublicSnipsBootstrapped = false;
    ensurePublicSnipsCatalogBootstrapped();
  } else {
    g.__tmiPublicSnipsBootstrapped = true;
  }
}

/** Clear runtime cache only — simulates process restart for certs. */
export function clearPublicSnipsRuntimeCacheForTests(): void {
  g.__tmiPublicSnipsCatalog = new Map();
  g.__tmiPublicSnipsBootstrapped = true;
}

/** Internal: shared Map for durable hydrate (server Authority only). */
export function getPublicSnipsCatalogMap(): Map<string, PublicSnipRecord> {
  return catalog();
}
