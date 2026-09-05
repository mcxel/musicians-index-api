/**
 * TMI Live System — barrel export
 * Import everything from "@/lib/live"
 */

export { liveIdentitySurfaceEngine } from "./LiveIdentitySurfaceEngine";
export type {
  FeedSource,
  LiveStatus,
  RoomContext,
  StaticIdentity,
  LiveFeedState,
  IdentitySurfaceRecord,
} from "./LiveIdentitySurfaceEngine";

export { venuePresenceEngine } from "./VenuePresenceEngine";
export type {
  RoomType,
  PerformerFeed,
  VenueRoomState,
} from "./VenuePresenceEngine";

export { audienceVisibilityEngine } from "./AudienceVisibilityEngine";
export type {
  AvatarState,
  AvatarTier,
  AudienceAvatar,
  SeatPosition,
} from "./AudienceVisibilityEngine";

export { seatGridEngine, SEAT_UPGRADE_PRICES } from "./SeatGridEngine";
export type { SeatTier, SeatUpgradePrice, GridLayout, GridSeat } from "./SeatGridEngine";

export { roomEnergyEngine } from "./RoomEnergyEngine";
export type { RoomEnergyState } from "./RoomEnergyEngine";

export { sharedReactionEngine, REACTION_PACKS } from "./SharedReactionEngine";
export type {
  ReactionType,
  ReactionTier,
  ReactionItem,
  ReactionPack,
} from "./SharedReactionEngine";

export { botCrowdFillEngine } from "./BotCrowdFillEngine";
export type { BotCrowdConfig } from "./BotCrowdFillEngine";

export {
  resolveLiveDestination,
  materializeLiveRoute,
  loadPersistedLivePrivacy,
  persistLivePrivacy,
  loadPersistedPreferredExperience,
  persistPreferredExperience,
} from "./LiveDestinationRouter";
export type {
  LivePrivacy,
  LiveDestination,
  LiveDestinationInput,
  LiveDestinationFlags,
} from "./LiveDestinationRouter";

export {
  CANONICAL_WORLD_ZONE,
  CANONICAL_WORLD_ZONES,
  CANONICAL_WORLD_ZONE_GRAPH,
  CANONICAL_WORLD_VIEW_LAW,
  FULL_SPHERE_WORLD_RUNTIME,
  EXPERIENCE_ROOM_TYPE,
  EXPERIENCE_ROOM_ZONE,
  MASTER_VENUE_TOPOLOGY_LAW,
  SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID,
  SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
  SYSTEM_OPERATED_PERFORMER_LOBBY_ROOM_ID,
  LOUNGE_SIDE_ROOM_ROUTE_MAP,
  LOUNGE_RUNTIME_LAW,
  resolveFanWorldEntry,
  resolvePerformerWorldEntry,
  resolveLoungeWorldEntry,
  resolvePerformerLobbyWorldEntry,
  fanAvatarLobbyEntryHref,
  auditoriumEntryHref,
  performerStageHref,
  performerLobbyEntryHref,
  loungeSideRoomEntryHref,
  resolveHubMonitorViewport,
  resolveLoungeMonitorViewport,
  resolvePerformerLobbyMonitorViewport,
  hubMonitorUvrProps,
  perspectiveForRole,
  perspectiveForZone,
  entryZoneForRole,
  isSystemOperatedFanLobby,
  isSystemOperatedLounge,
  isLoungeRoomId,
  isLoungeZone,
  isPerformerLobbyZone,
  zoneAllowsAvatars,
  canonicalizeLoungeRoomId,
  parseCanonicalWorldZone,
  roomIdFromJoinRoute,
} from "./canonicalWorldViewport";
export type {
  CanonicalWorldZone,
  CanonicalViewportRole,
  HubMonitorSlot,
  ResolvedFanWorldEntry,
  ResolvedPerformerWorldEntry,
  ResolvedHubMonitorViewport,
  LoungeWorldEntry,
  PerformerLobbyWorldEntry,
  ExperienceRoomType,
} from "./canonicalWorldViewport";

export {
  resolveRoomPersonality,
  isPerformerLobbyRoomId,
  isFanAvatarGenreRoomId,
  isVideoPanelZone,
  FAN_LOBBY_PERSONALITY,
  PERFORMER_LOBBY_PERSONALITY,
} from "./Canonical3DRoomRuntime";
export type { RoomPersonalityId, RoomPersonalityLaw } from "./Canonical3DRoomRuntime";

export {
  PERFORMER_LOBBY_MODES,
  PERFORMER_LOBBY_MODE_LABELS,
  parsePerformerLobbyMode,
} from "./performerLobbyModes";
export type { PerformerLobbyMode } from "./performerLobbyModes";

export {
  PERFORMER_LOBBY_VIDEO_PRESENCE_LAW,
  PERFORMER_LOBBY_PROPS,
  PERFORMER_LOBBY_FLOOR_BOUNDS,
  joinPerformerVideoPanel,
  leavePerformerVideoPanel,
  applyPerformerPanelSkin,
  applyPerformerProximity,
  collidePerformerMove,
  movePerformerPanel,
} from "./performerLobbyVideoPresenceLaw";

export {
  listGenreRoomDefinitions,
  getGenreRoomByRoomId,
  getCanonicalGenreRoomDefinition,
  CANONICAL_GENRE_IDS,
  CANONICAL_GENRE_ROOM_REGISTRY,
  BASELINE_GENRE_LOBBY_ROOM_IDS,
  FAN_GENRE_ROOM_REGISTRY,
  PERFORMER_GENRE_ROOM_REGISTRY,
  PERFORMER_GENRE_IDS,
  resolveGenreLobbyJoinHref,
  isCanonicalGenreRoomId,
  isFanGenreRoomId,
} from "./CanonicalGenreRegistry";
export type {
  CanonicalGenreRoomDefinition,
  CanonicalGenreId,
  GenreRoomDefinition,
  GenreLobbySide,
  PerformerGenreId,
} from "./CanonicalGenreRegistry";

export {
  ensurePerformerGenreRoomsSeeded,
  ensureFanGenreRoomsSeeded,
  ensureGenreRoomsSeeded,
  getPerformerGenreDiscoveryRecords,
  getFanGenreDiscoveryRecords,
  getAllGenreDiscoveryRecords,
  isPerformerGenreRoomId,
  getPerformerGenreRoomTheme,
  getFanGenreRoomTheme,
  getGenreRoomTheme,
} from "./performerGenreRoomNetwork";

export {
  DEFAULT_PERFORMER_PANEL_SKIN,
  resolvePerformerPanelSkin,
} from "./PerformerLobbyPersonality";
export type { PerformerPanelSkinId } from "./PerformerLobbyPersonality";

export {
  EXPERIENCE_ROOM_REGISTRY,
  EXPERIENCE_CLASSES,
  VIP_STAGELOADER_FOLD_STATUS,
  GENRE_LOBBY_BASELINE,
  getExperienceRoom,
  listExperienceRooms,
  parseExperienceClass,
  millHrefForExperience,
  millHrefForGenreLobby,
  arenaEventTypeForExperience,
  aliasedToMillThisPass,
  stillStandaloneShells,
  isBaselineGenreLobbyRoomId,
  listGenreLobbyExperienceIndex,
} from "./ExperienceRoomRegistry";
export type {
  ExperienceClass,
  ExperienceAliasStatus,
  ExperienceRoomDefinition,
} from "./ExperienceRoomRegistry";

export {
  LOUNGE_VIDEO_PRESENCE_LAW,
  LOUNGE_AD_CHASSIS_TYPES,
  LOUNGE_AD_ANCHORS,
  listLoungeAdSurfaces,
  resolveLoungeAdSurface,
  joinLoungeVideoPanel,
  leaveLoungeVideoPanel,
  applyLoungeChassisSkin,
} from "./loungeVideoPresenceLaw";
export type {
  LoungeAdChassis,
  LoungeAdSurface,
  LoungeParticipantChassis,
} from "./loungeVideoPresenceLaw";

export {
  loadPersistedLiveDevices,
  persistLiveDevices,
  clearPersistedLiveDevices,
  buildLiveMediaConstraints,
  persistDevicesFromStream,
  hasPriorLiveDevices,
} from "./liveDevicePersistence";
export type { PersistedLiveDevices } from "./liveDevicePersistence";

export { billboardPortalEngine } from "./BillboardPortalEngine";
export type { BillboardPortal } from "./BillboardPortalEngine";

export { publicLiveFeedEngine } from "./PublicLiveFeedEngine";
export type { PublicFeedEntry } from "./PublicLiveFeedEngine";
