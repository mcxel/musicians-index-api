/**
 * JumbotronContracts.ts — Canonical Automated Jumbotron Director Contracts
 *
 * Laws:
 * 1. ONE AutomatedJumbotronDirector + ONE canonical event/priority pipeline.
 * 2. Strict Priority: P1 Safety > P2 Live Critical > P3 Gift/Reward > P4 Direct Sponsor > P5 Ads/House > P6 Ambient.
 * 3. Style may vary; TRUTH may never vary.
 * 4. Zero fake users, fake gifts, fake winners, fake seats, or fake audience excitement.
 */

import type { DisplayTargetClass } from "../monitors/DisplayTargetDirector";

export type { DisplayTargetClass };

export enum JumbotronPriority {
  P1_SAFETY_MODERATION_EMERGENCY = 1,
  P2_LIVE_EXPERIENCE_CRITICAL = 2,
  P3_TRANSACTION_REWARD_GIFT = 3,
  P4_CONTRACTED_DIRECT_SPONSOR = 4,
  P5_ADS_HOUSE_PROMOS = 5,
  P6_AMBIENT = 6,
}

export type JumbotronExperienceType =
  | "BATTLE_ARENA"
  | "CHALLENGE_ARENA"
  | "CYPHER"
  | "REGULAR_LIVE"
  | "WORLD_DANCE_PARTY"
  | "AUDITORIUM"
  | "GAME_SHOW"
  | "LOUNGE"
  | "MONDAY_NIGHT_STAGE"
  | "WORLD_CONCERT"
  | "WORLD_RELEASE"
  | "FAN_LOBBY"
  | "PERFORMER_LOBBY";

export type JumbotronEventType =
  | "SAFETY_ALERT"
  | "EMERGENCY_BROADCAST"
  | "CHALLENGE_OBJECTIVE_REVEAL"
  | "CHALLENGE_ATTEMPT_TICK"
  | "CHALLENGE_JUDGMENT_OPEN"
  | "CHALLENGE_RESULT"
  | "ROUND_TIMER_TICK"
  | "ROUND_TIMER_CRITICAL"
  | "ROUND_WINNER"
  | "BATTLE_SCOREBOARD_UPDATE"
  | "CYPHER_ROTATION_NEXT"
  | "CYPHER_ARTIST_SPOTLIGHT"
  | "GIFT_ALERT"
  | "REWARD_AWARDED"
  | "SEAT_SPOTLIGHT"
  | "AUDIENCE_CROWD_METER"
  | "DIRECT_SPONSOR_CAMPAIGN"
  | "HOUSE_PROMOTION"
  | "CERTIFIED_AD_NETWORK"
  | "CURTAIN_INTERMISSION_START"
  | "CURTAIN_COUNTDOWN_RETURN"
  | "CURTAIN_SPONSOR_WRAP"
  | "CURTAIN_INTERMISSION_END"
  | "DISCO_ORB_BEAT_PULSE"
  | "DISCO_ORB_ROTATION_SHIFT"
  | "CAST_PLAYLIST_ARTWORK"
  | "CAST_MEMORY_MOMENT"
  | "CAST_YOPHO_CARD"
  | "AMBIENT_UPCOMING_SCHEDULE"
  | "AMBIENT_IDLE";

export type AwardVisualTreatment =
  | "SCOREBOARD_FLIP"
  | "GOLD_TICKET"
  | "SPINNING_NUMBER"
  | "SEAT_SPOTLIGHT"
  | "AVATAR_BURST";

/**
 * Immutable economic and participant truth.
 * Presentation STYLE may vary across templates; these fields remain IMMUTABLE.
 */
export interface ImmutableRewardTruth {
  recipientId: string;
  recipientDisplayName: string;
  amountPoints: number;
  eventName: string;
  timestampMs: number;
  sourceTransactionId: string;
  rewardLedgerReference: string;
}

export interface ImmutableGiftTruth {
  senderId: string;
  senderDisplayName: string;
  recipientId: string;
  recipientDisplayName: string;
  giftItemId: string;
  giftItemName: string;
  amountCents: number;
  settledTransactionId: string;
  timestampMs: number;
}

export interface AudienceSpotlightIdentity {
  userId: string;
  displayName: string;
  seatId?: string;
  avatarMeshUrl?: string;
  hasLiveCameraConsent: boolean;
  isAgeVerifiedSafe: boolean;
  publicProfilePermitted: boolean;
}

export interface JumbotronEvent {
  id: string;
  traceId: string;
  priority: JumbotronPriority;
  eventType: JumbotronEventType;
  experienceType: JumbotronExperienceType;
  targetClass: DisplayTargetClass;
  sourceEventId: string;
  title: string;
  headline?: string;
  subline?: string;
  durationMs: number;
  createdAtMs: number;
  expiresAtMs?: number;
  
  // Real truth payloads
  rewardTruth?: ImmutableRewardTruth;
  giftTruth?: ImmutableGiftTruth;
  spotlightIdentity?: AudienceSpotlightIdentity;
  sponsorCampaignId?: string;
  advertiserName?: string;
  creativeUrl?: string;
  roundTimerSeconds?: number;
  battleScores?: { participantA: string; scoreA: number; participantB: string; scoreB: number };
  crowdActivityScore?: number; // 0.0 to 1.0, strictly derived from real telemetry
  
  // Visual template and metadata
  templateId?: string;
  accentColor?: string;
  isCoalesced?: boolean;
}

export interface JumbotronPresentationPack {
  id: string;
  name: string;
  experienceType: JumbotronExperienceType;
  supportedTargets: DisplayTargetClass[];
  primaryTarget: DisplayTargetClass;
  lightingProfile: string;
  animationProfile: string;
  brandPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  allowedEventTypes: JumbotronEventType[];
  proceduralFeatures: {
    hasScoreboard: boolean;
    hasRoundTimer: boolean;
    hasCrowdMeter: boolean;
    hasDiscoOrb: boolean;
    hasTheaterCurtain: boolean;
    hasCollaborativeRotation: boolean;
    allowWinnerPresentation: boolean; // STRICT LAW: Cyphers must be FALSE
  };
}

export interface JumbotronDirectorTelemetry {
  traceId: string;
  sessionId: string;
  experienceType: JumbotronExperienceType;
  target: DisplayTargetClass;
  priority: JumbotronPriority;
  eventType: JumbotronEventType;
  sourceEventId: string;
  templateId: string;
  sponsorCampaignId?: string;
  rewardTransactionId?: string;
  startedAtMs: number;
  endedAtMs: number;
  preemptedByPriority?: JumbotronPriority;
  preemptedByEventId?: string;
  result: "COMPLETED" | "PREEMPTED" | "DROPPED" | "TARGET_UNAVAILABLE" | "SETTLEMENT_REJECTED";
  latencyMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHYSICAL JUMBOTRON GEOMETRY & SIGHTLINE CONTRACTS (P0 ARENA SIGHTLINE LAW)
// ─────────────────────────────────────────────────────────────────────────────

export type VenuePhysicalEnvironmentType =
  | "INDOOR_ARENA"
  | "OUTDOOR_STADIUM"
  | "CLUB_SMALL_ROOM"
  | "WORLD_DANCE_PARTY"
  | "PROSCENIUM_THEATER";

export interface VenueSpatialDimensions {
  venueId: string;
  venueEnvironment: VenuePhysicalEnvironmentType;
  widthFeet: number;
  depthFeet: number;
  heightFeet: number;
  widthMeters: number;
  depthMeters: number;
  heightMeters: number;
  floorElevationMeters: number;
  ceilingElevationMeters: number;
  stageCourtCenter: [number, number, number]; // [x, y, z] in world coordinates
  cameraSphereFovDegrees: number; // Consumed dynamically from canonical venue runtime — NEVER hardcoded!
}

export type SeatingTierClass =
  | "LOWER_BOWL"
  | "MID_BOWL"
  | "UPPER_BOWL"
  | "FLOOR_GA"
  | "VIP"
  | "SIDE_SECTIONS"
  | "REAR_SECTIONS";

export interface SeatingTierZone {
  tierId: string;
  tierName: string;
  tierClass: SeatingTierClass;
  quadrant: "NORTH" | "SOUTH" | "EAST" | "WEST" | "CENTER";
  elevationMeters: number;
  radialDistanceMeters: number;
  representativeEyePositions: [number, number, number][]; // Sampled viewer eye positions [x, y, z]
}

export type JumbotronFaceOrientation =
  | "NORTH"
  | "SOUTH"
  | "EAST"
  | "WEST"
  | "BOTTOM_RING"
  | "UPPER_RIBBON"
  | "OUTDOOR_ENDZONE"
  | "DISCO_SPHERE";

export interface JumbotronDisplayFace {
  faceId: string;
  orientation: JumbotronFaceOrientation;
  targetClass: DisplayTargetClass;
  centerPosition: [number, number, number];
  normalVector: [number, number, number]; // Outward normal [nx, ny, nz]
  widthMeters: number;
  heightMeters: number;
  cantAngleDegrees: number; // Downward tilt angle (typically 5°–12° for arena scoreboards)
}

export interface JumbotronCollisionEnvelope {
  /** Axis-aligned safe volume around the jumbotron (world meters). */
  min: [number, number, number];
  max: [number, number, number];
  /** Extra clearance buffer beyond physical mesh for performers / props. */
  clearanceBufferMeters: number;
}

export interface PhysicalJumbotronDescriptor {
  targetId: string;
  architecture:
    | "CENTER_HUNG_ARENA_JUMBOTRON"
    | "END_ZONE_DISPLAY"
    | "FIELD_EDGE_DISPLAY"
    | "WALL_HANGING_LED"
    | "CENTER_HUNG_DISCO_ORB"
    | "REAR_STAGE_DISPLAY";
  centerPosition: [number, number, number]; // [x, y, z] world coordinates
  dimensions: {
    widthMeters: number;
    heightMeters: number;
    depthMeters: number;
  };
  bottomClearanceMeters: number; // Height above floor/court
  safeRiggingElevationMeters: number; // Hanging elevation under roof
  /** Ceiling hoist / truss attach point. */
  mountRiggingAnchor: [number, number, number];
  /** Collision / safe envelope used by seating + prop systems. */
  collisionEnvelope: JumbotronCollisionEnvelope;
  /** Preferred viewing orientation for LOOK UP / focus (yaw degrees, world). */
  viewingOrientationYawDegrees: number;
  faces: JumbotronDisplayFace[];
  hasBottomRing: boolean;
  hasUpperRibbon: boolean;
  isProceduralGenerated: boolean;
  /** Auxiliary wall/rail displays activated when a tier fails primary sightline. */
  auxiliaryDisplaysActivated: boolean;
}

export interface SightlineVerificationResult {
  tierId: string;
  tierClass: SeatingTierClass;
  eyePosition: [number, number, number];
  bestVisibleFace: JumbotronDisplayFace;
  isUnobstructed: boolean;
  pitchAngleDegrees: number; // Viewer head tilt upwards [0° = horizontal, 90° = vertical up]
  incidentAngleDegrees: number; // Off-normal angle [0° = facing dead-on, 90° = edge-on]
  projectedScreenRatio: number; // Screen angular size relative to comfortable viewing cone
  passed: boolean;
  failureReason?: string;
}

export interface PhysicalSightlineAuditReport {
  venueId: string;
  environment: VenuePhysicalEnvironmentType;
  jumbotronArchitecture: string;
  totalSampledZones: number;
  passedZones: number;
  failedZones: number;
  tierResults: SightlineVerificationResult[];
  certifiedSightlinesAllOccupiedZones: boolean;
}
