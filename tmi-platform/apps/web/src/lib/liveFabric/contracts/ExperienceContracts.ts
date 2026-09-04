/**
 * ExperienceContracts.ts — Experience presentation contracts (all experience types)
 */

import type { PresentationLayout } from "./PresentationContracts";
import type { HostSuccessionPolicy } from "./LiveSessionContracts";
import { FABRIC_CONTRACT_VERSIONS } from "./ContractVersions";

export type CanonicalExperienceType =
  | "REGULAR_GO_LIVE"
  | "FAN_SOCIAL_LIVE"
  | "FAN_LOBBY"
  | "PERFORMER_LOBBY"
  | "BATTLE"
  | "CYPHER"
  | "CHALLENGE"
  | "GAUNTLET"
  | "DIRTY_DOZENS"
  | "DANCE_OFF"
  | "JOKE_OFF"
  | "WORLD_DANCE_PARTY"
  | "MONDAY_NIGHT_STAGE"
  | "MINI_CONCERT"
  | "WORLD_CONCERT"
  | "WORLD_RELEASE"
  | "LISTENING_PARTY"
  | "WATCH_PARTY"
  | "REHEARSAL"
  | "GAME_SHOW"
  | "INTERVIEW"
  | "AUDITION";

export interface AccessibilityPresentationContract {
  reducedMotionLayout: PresentationLayout;
  highContrastOverlay: boolean;
  captionSafeZone: boolean;
  screenReaderLabels: Record<string, string>;
  allowFlashEffects: boolean;
  /** Reduced motion → no Voltron flash morph. */
  suppressVoltronMorph: boolean;
}

export interface ExperiencePresentationContract {
  experienceType: CanonicalExperienceType;
  contractVersion: string;
  allowedLayouts: PresentationLayout[];
  defaultLayout: PresentationLayout;
  /** REQUIRED — every experience MUST have a valid one-display composition. */
  singleScreenFallbackLayout: PresentationLayout;
  voltronAllowed: boolean;
  focusPolicy: "HOST_ONLY" | "SPEAKER_ACTIVE" | "ROUND_BASED" | "PRODUCER_DIRECTED";
  audiencePolicy: "AVATAR_WALL" | "GRID_TILES" | "REACTIONS_ONLY" | "HIDDEN";
  judgePolicy: "NONE" | "CARD_OVERLAY" | "FRAME_SLOT" | "FULL_TAKEOVER";
  overlayPackId: string;
  hostSuccessionPolicy: HostSuccessionPolicy;
  hostGracePeriodMs: number;
  entranceBehavior: string;
  roundBehavior: string;
  finaleBehavior: string;
  accessibility: AccessibilityPresentationContract;
  requiredFrameSlots: string[];
  optionalFrameSlots: string[];
}

export const EXPERIENCE_CONTRACT_VERSION =
  FABRIC_CONTRACT_VERSIONS.EXPERIENCE_PRESENTATION;

export const ALL_CANONICAL_EXPERIENCE_TYPES: readonly CanonicalExperienceType[] = [
  "REGULAR_GO_LIVE",
  "FAN_SOCIAL_LIVE",
  "FAN_LOBBY",
  "PERFORMER_LOBBY",
  "BATTLE",
  "CYPHER",
  "CHALLENGE",
  "GAUNTLET",
  "DIRTY_DOZENS",
  "DANCE_OFF",
  "JOKE_OFF",
  "WORLD_DANCE_PARTY",
  "MONDAY_NIGHT_STAGE",
  "MINI_CONCERT",
  "WORLD_CONCERT",
  "WORLD_RELEASE",
  "LISTENING_PARTY",
  "WATCH_PARTY",
  "REHEARSAL",
  "GAME_SHOW",
  "INTERVIEW",
  "AUDITION",
] as const;
