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

export { billboardPortalEngine } from "./BillboardPortalEngine";
export type { BillboardPortal } from "./BillboardPortalEngine";

export { publicLiveFeedEngine } from "./PublicLiveFeedEngine";
export type { PublicFeedEntry } from "./PublicLiveFeedEngine";
