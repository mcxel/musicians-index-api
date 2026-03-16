export type Role = "USER" | "ADMIN" | "ARTIST" | "STAFF";

export type UserPublic = {
  id: string;
  role: Role;
  name: string | null;
  email: string | null;
  image: string | null;
  emailVerified?: string | null;
};

export type ArtistPublic = {
  id: string;
  name: string;
  userId: string;
  bio: string | null;
};

export type ApiError = { message: string; code?: string };
export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: ApiError };

// ProductKey is an open branded string to allow marketplace and promo keys
export type ProductKey = string & { __brand?: "ProductKey" };

// PlacementSurface is intentionally permissive to accommodate app-specific surfaces
export type PlacementSurface = string & {};

// PlacementContext combines fields used across apps and the promo-bridge
export type PlacementContext = {
  surface: PlacementSurface;
  moduleKey: string; // which site/app is rendering
  route?: string; // pathname, optional for simple placements
  locale?: string;
  userRole?: Role;
  sessionId?: string; // for frequency caps
  userId?: string;
};

// Promo creative is a small, flexible shape used by the promo system and HUD
export type PromoCreative = {
  id?: string;
  title?: string;
  headline?: string;
  subhead?: string;
  body?: string;
  cta?: string;
  href?: string;
  badge?: string;
  imageUrl?: string;
};

export type PromoSlot = {
  id: string;
  product: ProductKey;
  priority: number; // higher wins
  creative: PromoCreative;
  impressionKey: string; // telemetry key
};
