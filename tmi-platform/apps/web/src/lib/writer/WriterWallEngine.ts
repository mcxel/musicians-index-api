// WriterWallEngine — manages all work items on a writer's wall.
// Three sources:
//   1. auto — system pushes published TMI articles here
//   2. upload — writer manually adds past work / portfolio
//   3. assignment — editorial system records completed paid work

import type { WriterWorkItem, WriterWorkKind } from "@/types/memory";

const store = new Map<string, WriterWorkItem[]>(); // writerId → items

function makeId(kind: string): string {
  return `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function save(item: WriterWorkItem): void {
  const list = store.get(item.writerId) ?? [];
  store.set(item.writerId, [item, ...list]);
}

// ─── System creators ──────────────────────────────────────────────────────────

/** Called by editorial engine when a TMI article publishes */
export function recordPublishedArticle(
  writerId: string,
  opts: {
    title: string;
    articleSlug: string;
    description?: string;
    kind?: WriterWorkKind;
    metrics?: WriterWorkItem["metrics"];
  },
): WriterWorkItem {
  const item: WriterWorkItem = {
    id: makeId("article"),
    writerId,
    kind: opts.kind ?? "article",
    title: opts.title,
    description: opts.description,
    articleSlug: opts.articleSlug,
    status: "published",
    visibility: "public",
    metrics: opts.metrics,
    verified: true,
    createdAt: new Date().toISOString(),
  };
  save(item);
  return item;
}

/** Called by editorial assignment engine when paid work completes */
export function recordAssignment(
  writerId: string,
  opts: {
    title: string;
    description?: string;
    paidAmount?: number;
    articleSlug?: string;
  },
): WriterWorkItem {
  const item: WriterWorkItem = {
    id: makeId("assignment"),
    writerId,
    kind: "assignment",
    title: opts.title,
    description: opts.description,
    articleSlug: opts.articleSlug,
    status: "published",
    visibility: "public",
    metrics: { paidAmount: opts.paidAmount },
    verified: true,
    createdAt: new Date().toISOString(),
  };
  save(item);
  return item;
}

// ─── Writer-controlled uploads ────────────────────────────────────────────────

/** Writer uploads past work, portfolio sample, image, or draft */
export function addPortfolioItem(
  writerId: string,
  opts: {
    kind: WriterWorkKind;
    title: string;
    description?: string;
    mediaUrl?: string;
    publication?: string;
    visibility?: WriterWorkItem["visibility"];
  },
): WriterWorkItem {
  const item: WriterWorkItem = {
    id: makeId(opts.kind),
    writerId,
    kind: opts.kind,
    title: opts.title,
    description: opts.description,
    mediaUrl: opts.mediaUrl,
    publication: opts.publication,
    status: opts.kind === "draft" ? "draft" : "published",
    visibility: opts.visibility ?? "public",
    verified: false,
    createdAt: new Date().toISOString(),
  };
  save(item);
  return item;
}

export function updateVisibility(
  writerId: string,
  itemId: string,
  visibility: WriterWorkItem["visibility"],
): void {
  const list = store.get(writerId) ?? [];
  store.set(writerId, list.map((i) => i.id === itemId ? { ...i, visibility } : i));
}

export function removeItem(writerId: string, itemId: string): void {
  const list = store.get(writerId) ?? [];
  store.set(writerId, list.filter((i) => i.id !== itemId));
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function getWall(writerId: string): WriterWorkItem[] {
  return store.get(writerId) ?? [];
}

export function getPublicWall(writerId: string): WriterWorkItem[] {
  return (store.get(writerId) ?? []).filter((i) => i.visibility === "public" && i.status !== "draft");
}

export function getPublishedArticles(writerId: string): WriterWorkItem[] {
  return (store.get(writerId) ?? []).filter((i) => i.kind === "article" && i.status === "published");
}

export function getPortfolio(writerId: string): WriterWorkItem[] {
  return (store.get(writerId) ?? []).filter((i) => ["past-work", "image", "interview", "review", "feature"].includes(i.kind));
}

export function getDrafts(writerId: string): WriterWorkItem[] {
  return (store.get(writerId) ?? []).filter((i) => i.status === "draft");
}

/** Alias for getPublicWall — used by profile pages */
export function getPublicItems(writerId: string): WriterWorkItem[] {
  return getPublicWall(writerId);
}

/** Alias for getWall — returns all items including private/drafts (hub owner view) */
export function getWorkItems(writerId: string): WriterWorkItem[] {
  return getWall(writerId);
}

/** Seed demo data for a writer slug (no-op if already seeded) */
export function seedWriterWall(writerId: string): void {
  if ((store.get(writerId) ?? []).length > 0) return;
  const items: WriterWorkItem[] = [
    {
      id: `seed-a1-${writerId}`,
      writerId,
      kind: "article",
      title: "Battle Culture in 2026",
      description: "A deep dive into live battle rap.",
      articleSlug: "battle-culture-2026",
      status: "published",
      visibility: "public",
      verified: true,
      metrics: { views: 24100, readTimeMinutes: 11, engagementRate: 28, sponsorLinked: true, paidAmount: 400 },
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      id: `seed-i1-${writerId}`,
      writerId,
      kind: "interview",
      title: "Nova Cipher: \"The Cypher Changed Everything\"",
      articleSlug: "nova-cipher-interview",
      status: "published",
      visibility: "public",
      verified: true,
      metrics: { views: 9200, readTimeMinutes: 8, engagementRate: 41 },
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: `seed-pw1-${writerId}`,
      writerId,
      kind: "past-work",
      title: "The Underground Map — Complex, 2024",
      publication: "Complex Magazine",
      status: "published",
      visibility: "public",
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
  ];
  store.set(writerId, items);
}
