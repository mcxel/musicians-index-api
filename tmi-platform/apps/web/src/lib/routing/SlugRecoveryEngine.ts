export type SlugEntity = "artist" | "performer" | "venue" | "event" | "article" | "producer" | "sponsor";

export interface SlugResolution {
  slug: string;
  entity: SlugEntity;
  resolvedId: string | null;
  fallbackRoute: string;
  found: boolean;
  resolvedAt: string;
}

const slugCache = new Map<string, SlugResolution>();
const entityFallbacks: Record<SlugEntity, string> = {
  artist:    "/artists",
  performer: "/performers",
  venue:     "/venues",
  event:     "/events",
  article:   "/articles",
  producer:  "/beat-lab",
  sponsor:   "/sponsors",
};

export function registerSlug(entity: SlugEntity, slug: string, entityId: string): void {
  slugCache.set(`${entity}:${slug}`, {
    slug,
    entity,
    resolvedId: entityId,
    fallbackRoute: entityFallbacks[entity],
    found: true,
    resolvedAt: new Date().toISOString(),
  });
}

export function resolveSlug(entity: SlugEntity, slug: string): SlugResolution {
  const key = `${entity}:${slug}`;
  const cached = slugCache.get(key);
  if (cached) return cached;

  const resolution: SlugResolution = {
    slug,
    entity,
    resolvedId: null,
    fallbackRoute: entityFallbacks[entity],
    found: false,
    resolvedAt: new Date().toISOString(),
  };
  slugCache.set(key, resolution);
  return resolution;
}

export function getFallbackForMissingSlug(entity: SlugEntity): string {
  return entityFallbacks[entity];
}

export function clearSlugCache(entity?: SlugEntity): void {
  if (!entity) {
    slugCache.clear();
    return;
  }
  for (const key of slugCache.keys()) {
    if (key.startsWith(`${entity}:`)) slugCache.delete(key);
  }
}

export function getKnownSlugs(entity: SlugEntity): string[] {
  const prefix = `${entity}:`;
  return [...slugCache.keys()]
    .filter((k) => k.startsWith(prefix) && slugCache.get(k)!.found)
    .map((k) => k.slice(prefix.length));
}
