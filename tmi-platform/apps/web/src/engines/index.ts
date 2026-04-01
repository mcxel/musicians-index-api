/**
 * TMI Platform — Client-Side Engine Registry
 * Central barrel export for all platform engines.
 *
 * Phase 8 Engines (10 total):
 * 8.1 Core:        economy, effects, achievement
 * 8.2 Live World:  lobby, party, julius
 * 8.3 Commerce:    store, ad
 * 8.4 Media:       replay, venue-booking
 */

// ─── 8.1 Core Engines ──────────────────────────────────────────────────────────

export {
  EconomyEngine,
  economyEngine,
  useEconomyEngine,
  SUBSCRIPTION_TIERS,
  POINT_RULES,
  CURRENCY_CONFIG,
} from './economy.engine';
export type {
  SubscriptionTier,
  PointAction,
  SupportedCurrency,
  WalletState,
} from './economy.engine';

export {
  EffectsEngine,
  effectsEngine,
  useEffectsEngine,
  EFFECT_REGISTRY,
} from './effects.engine';
export type {
  EffectCategory,
  EffectDefinition,
  EffectTrigger,
  EffectLayer,
  ActiveEffect,
} from './effects.engine';

export {
  AchievementEngine,
  achievementEngine,
  useAchievementEngine,
  ACHIEVEMENT_REGISTRY,
} from './achievement.engine';
export type {
  AchievementCategory,
  AchievementRarity,
  AchievementTrigger,
  AchievementDefinition,
  AchievementProgress,
  UserAchievementState,
} from './achievement.engine';

// ─── 8.2 Live World Engines ────────────────────────────────────────────────────

export {
  LobbyEngine,
  lobbyEngine,
  useLobbyEngine,
  LOBBY_THEME_CONFIG,
  LOBBY_TYPE_CONFIG,
} from './lobby.engine';
export type {
  LobbyType,
  LobbyTheme,
  LobbyStatus,
  LobbyMember,
  LobbyState,
  LobbyChatMessage,
  LobbyInvite,
} from './lobby.engine';

export {
  PartyEngine,
  partyEngine,
  usePartyEngine,
  PARTY_SIZE_LIMITS,
} from './party.engine';
export type {
  PartyStatus,
  PartyRole,
  PartyVisibility,
  PartyMember,
  PartyState,
  PartyInvite,
  PartyChatMessage,
  ReadyCheckState,
} from './party.engine';

export {
  JuliusEngine,
  juliusEngine,
  useJuliusEngine,
  JULIUS_MOOD_CONFIG,
} from './julius.engine';
export type {
  JuliusMood,
  JuliusAnimationId,
  JuliusEffectId,
  JuliusPollStatus,
  JuliusGameType,
  JuliusChatMessage,
  JuliusPoll,
  JuliusGame,
  JuliusStoreItem,
  JuliusShoulderPet,
  JuliusState,
} from './julius.engine';

// ─── 8.3 Commerce Engines ──────────────────────────────────────────────────────

export {
  StoreEngine,
  storeEngine,
  useStoreEngine,
} from './store.engine';
export type {
  ProductCategory,
  ProductCurrency,
  OrderStatus,
  StoreProduct,
  CartItem,
  Cart,
  Order,
  StoreFilters,
} from './store.engine';

export {
  AdEngine,
  adEngine,
  useAdEngine,
} from './ad.engine';
export type {
  AdFormat,
  AdPlacement,
  AdStatus,
  AdTargetingType,
  AdTargeting,
  Ad,
  AdSlotConfig,
  ImpressionRecord,
  ClickRecord,
} from './ad.engine';

// ─── 8.4 Media Engines ─────────────────────────────────────────────────────────

export {
  ReplayEngine,
  replayEngine,
  useReplayEngine,
} from './replay.engine';
export type {
  ReplayStatus,
  ReplayQuality,
  PlaybackState,
  ReplaySession,
  ReplayHighlight,
  ReplayChapter,
  PlaybackPosition,
  ReplayFilters,
} from './replay.engine';

export {
  VenueBookingEngine,
  venueBookingEngine,
  useVenueBookingEngine,
} from './venue-booking.engine';
export type {
  BookingStatus,
  VenueType,
  BookingTier,
  VenueLocation,
  Venue,
  BookingRequest,
  VenueOffer,
  VenueRecommendation,
  TerritoryRule,
  BookingFilters,
} from './venue-booking.engine';
