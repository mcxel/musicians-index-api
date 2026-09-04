/**
 * BookingProfileStore — ONE canonical booking profile per entity (no duplicate DB).
 * Consumed by Discovery Wall, Near You map, BookingCanister, BOOK ME CTAs.
 * In-memory until Prisma persistence lands; Rule 20 honest empty when unset.
 */

export type PerformanceType =
  | "live_set"
  | "dj"
  | "comedy"
  | "dance"
  | "producer"
  | "band"
  | "virtual"
  | "other";

export type LookingForRole =
  | "singer"
  | "rapper"
  | "dj"
  | "producer"
  | "dancer"
  | "comedian"
  | "band"
  | "instrumentalist"
  | "promoter"
  | "venue";

export interface BookingProfile {
  entityId: string;
  entityType: "performer" | "venue";
  bookMeEnabled: boolean;
  categories: PerformanceType[];
  /** Quote floor in USD cents — 0 means "request quote". */
  rateMinCents: number;
  rateMaxCents: number;
  travelRadiusMiles: number;
  /** Public city/region only — never private home address. */
  publicCity: string;
  publicRegion: string;
  availableTonight: boolean;
  availableThisWeekend: boolean;
  virtualAvailable: boolean;
  lookingFor: LookingForRole[];
  notes: string;
  updatedAtMs: number;
}

const profiles = new Map<string, BookingProfile>();

function key(entityType: "performer" | "venue", entityId: string): string {
  return `${entityType}:${entityId}`;
}

export function emptyBookingProfile(
  entityId: string,
  entityType: "performer" | "venue",
  publicCity = "",
  publicRegion = "",
): BookingProfile {
  return {
    entityId,
    entityType,
    bookMeEnabled: false,
    categories: [],
    rateMinCents: 0,
    rateMaxCents: 0,
    travelRadiusMiles: 50,
    publicCity,
    publicRegion,
    availableTonight: false,
    availableThisWeekend: false,
    virtualAvailable: true,
    lookingFor: [],
    notes: "",
    updatedAtMs: Date.now(),
  };
}

export function getBookingProfile(
  entityType: "performer" | "venue",
  entityId: string,
): BookingProfile | null {
  return profiles.get(key(entityType, entityId)) ?? null;
}

export function getOrCreateBookingProfile(
  entityType: "performer" | "venue",
  entityId: string,
  publicCity = "",
  publicRegion = "",
): BookingProfile {
  const existing = getBookingProfile(entityType, entityId);
  if (existing) return existing;
  const created = emptyBookingProfile(entityId, entityType, publicCity, publicRegion);
  profiles.set(key(entityType, entityId), created);
  return created;
}

export function upsertBookingProfile(
  patch: Partial<BookingProfile> & {
    entityId: string;
    entityType: "performer" | "venue";
  },
): BookingProfile {
  const current =
    getBookingProfile(patch.entityType, patch.entityId) ??
    emptyBookingProfile(patch.entityId, patch.entityType);

  const next: BookingProfile = { ...current, updatedAtMs: Date.now() };
  (Object.keys(patch) as (keyof BookingProfile)[]).forEach((k) => {
    const v = patch[k];
    if (v !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (next as any)[k] = v;
    }
  });
  next.entityId = patch.entityId;
  next.entityType = patch.entityType;
  profiles.set(key(patch.entityType, patch.entityId), next);
  return next;
}

export function listBookableProfiles(
  entityType?: "performer" | "venue",
): BookingProfile[] {
  const all = [...profiles.values()].filter((p) => p.bookMeEnabled);
  if (!entityType) return all;
  return all.filter((p) => p.entityType === entityType);
}

export function listLookingForProfiles(): BookingProfile[] {
  return [...profiles.values()].filter((p) => p.lookingFor.length > 0);
}

export function isBookableNow(
  entityType: "performer" | "venue",
  entityId: string,
): boolean {
  const p = getBookingProfile(entityType, entityId);
  if (!p?.bookMeEnabled) return false;
  return p.availableTonight || p.availableThisWeekend || p.virtualAvailable;
}
