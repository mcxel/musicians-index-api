/**
 * §20982/§20983 — TMI Global Newsroom / Free Global + Local News Source Mesh.
 * FIRST REAL SLICE — not the full spec. Canonical source registry + one real,
 * working connector (USGS earthquakes). GDELT/NWS/fire-agency/local-journalism
 * connectors, the rights engine, event clustering, editorial-review wiring,
 * and the scheduler are NOT built here — reported as gaps, never stubbed as
 * if complete (Rule 20).
 *
 * Reuse audit performed before writing this file: no existing GDELT/news-
 * ingestion/RSS/connector-registry infrastructure found anywhere in the repo.
 * lib/news/NewsRailEngine.ts is a display-layer ticker-rotation widget, not a
 * source/ingestion system — a potential future CONSUMER of this registry's
 * output, not a duplicate of it.
 */

export type NewsSourceType =
  | "RSS"
  | "ATOM"
  | "JSON_FEED"
  | "PUBLIC_API"
  | "LICENSED_API"
  | "OFFICIAL_GOVERNMENT_FEED"
  | "OFFICIAL_EMERGENCY_FEED"
  | "OFFICIAL_SCIENCE_FEED"
  | "OFFICIAL_WEATHER_FEED"
  | "OFFICIAL_PRESS_RELEASE"
  | "STRUCTURED_DATA"
  | "SITEMAP_DISCOVERY";

/**
 * Discovery rights and republication rights are separate (GDELT/BBC syndication
 * precedent). UNKNOWN_RIGHTS must default restrictive — never republish full
 * text/media on the strength of "a bot could fetch it."
 */
export type NewsSourceRightsMode =
  | "DISCOVERY_ONLY"
  | "LINK_AND_METADATA"
  | "SHORT_QUOTE_ALLOWED"
  | "FULL_TEXT_LICENSED"
  | "IMAGE_LICENSED"
  | "VIDEO_LICENSED"
  | "PUBLIC_DOMAIN"
  | "OFFICIAL_PUBLIC_INFORMATION"
  | "UNKNOWN_RIGHTS";

export type NewsSourceTrustTier = "OFFICIAL_PRIMARY" | "REPUTABLE_JOURNALISM" | "LICENSED_WIRE" | "CANDIDATE_UNVERIFIED";

export type NewsSourceHealthStatus = "HEALTHY" | "STALE" | "RATE_LIMITED" | "AUTH_FAILURE" | "PARSE_FAILURE" | "NEVER_POLLED";

export interface NewsSourceDefinition {
  sourceId: string;
  publisher: string;
  sourceType: NewsSourceType;
  /** Real endpoint — never a placeholder URL. */
  endpoint: string;
  /** §20983 — full geographic hierarchy, each level independently nullable.
   *  null at any level = that source's real scope stops above it (e.g. USGS
   *  is null at every level — worldwide; a hypothetical Fresno fire-department
   *  feed would set country/region/county/city all the way down). Never
   *  hardcode a specific country/city as if it were the architecture — these
   *  are per-source DATA fields, populated per real source as sources are
   *  actually added. */
  country: string | null;
  region: string | null;
  stateProvince: string | null;
  county: string | null;
  city: string | null;
  languages: readonly string[];
  topics: readonly string[];
  trustTier: NewsSourceTrustTier;
  rightsMode: NewsSourceRightsMode;
  fullTextAllowed: boolean;
  imageReuseAllowed: boolean;
  videoReuseAllowed: boolean;
  commercialReuseAllowed: boolean;
  requiresLicense: boolean;
  /** Minimum ms between polls — real rate-limit respect, not a UI decoration. */
  refreshPolicyMs: number;
  attributionRules: string;
}

export interface NewsSourceHealthState {
  sourceId: string;
  status: NewsSourceHealthStatus;
  lastPolledAt: number | null;
  lastSuccessAt: number | null;
  lastItemAt: number | null;
  failureCount: number;
  lastError: string | null;
}

const sourceRegistry = new Map<string, NewsSourceDefinition>();
const healthRegistry = new Map<string, NewsSourceHealthState>();

export function registerNewsSource(def: NewsSourceDefinition): void {
  sourceRegistry.set(def.sourceId, def);
  if (!healthRegistry.has(def.sourceId)) {
    healthRegistry.set(def.sourceId, {
      sourceId: def.sourceId,
      status: "NEVER_POLLED",
      lastPolledAt: null,
      lastSuccessAt: null,
      lastItemAt: null,
      failureCount: 0,
      lastError: null,
    });
  }
}

export function listNewsSources(): readonly NewsSourceDefinition[] {
  return [...sourceRegistry.values()];
}

export function getNewsSource(sourceId: string): NewsSourceDefinition | null {
  return sourceRegistry.get(sourceId) ?? null;
}

export function getNewsSourceHealth(sourceId: string): NewsSourceHealthState | null {
  return healthRegistry.get(sourceId) ?? null;
}

export function listNewsSourceHealth(): readonly NewsSourceHealthState[] {
  return [...healthRegistry.values()];
}

export function recordNewsSourcePollSuccess(sourceId: string, itemCount: number): void {
  const health = healthRegistry.get(sourceId);
  if (!health) return;
  const now = Date.now();
  health.status = "HEALTHY";
  health.lastPolledAt = now;
  health.lastSuccessAt = now;
  if (itemCount > 0) health.lastItemAt = now;
  health.failureCount = 0;
  health.lastError = null;
}

export function recordNewsSourcePollFailure(sourceId: string, status: NewsSourceHealthStatus, error: string): void {
  const health = healthRegistry.get(sourceId);
  if (!health) return;
  health.status = status;
  health.lastPolledAt = Date.now();
  health.failureCount += 1;
  health.lastError = error;
}

/**
 * Real backoff enforcement — a connector must check this BEFORE making a
 * network call, not just record failure after hammering the service. Honors
 * each source's own declared refreshPolicyMs. Returns true when no prior
 * poll is recorded (first run is always allowed).
 */
export function canPollNow(sourceId: string): boolean {
  const def = sourceRegistry.get(sourceId);
  const health = healthRegistry.get(sourceId);
  if (!def || !health || health.lastPolledAt == null) return true;
  return Date.now() - health.lastPolledAt >= def.refreshPolicyMs;
}

export function __resetNewsSourceRegistryForTests(): void {
  sourceRegistry.clear();
  healthRegistry.clear();
}
