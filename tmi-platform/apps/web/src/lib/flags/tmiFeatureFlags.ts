export type TmiFeatureFlagKey =
  | "auth"
  | "payments"
  | "uploads"
  | "messaging"
  | "tickets"
  | "ads"
  | "booking"
  | "subscriptions"
  | "bots"
  | "games"
  | "nfts";

export type TmiFeatureFlags = Record<TmiFeatureFlagKey, boolean>;

export const DEFAULT_FEATURE_FLAGS: TmiFeatureFlags = {
  auth: true,
  payments: false,
  uploads: false,
  messaging: false,
  tickets: false,
  ads: false,
  booking: false,
  subscriptions: false,
  bots: false,
  games: false,
  nfts: false,
};

export function isFeatureEnabled(flag: TmiFeatureFlagKey, flags: TmiFeatureFlags = DEFAULT_FEATURE_FLAGS): boolean {
  return Boolean(flags[flag]);
}
