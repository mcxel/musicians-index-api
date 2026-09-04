/**
 * ExperiencePresentationDirector — interface + registry of presentation packs.
 */

import type {
  BroadcastCompositionLayout,
  ExperiencePackId,
  PresenceModel,
  PresentationPrimitiveKind,
  RouteCapabilityContract,
} from "./types";
import {
  FORBIDDEN_CONCERT_COMPOSITIONS,
  FORBIDDEN_CYPHER_COMPOSITIONS,
  FORBIDDEN_DANCE_PARTY_COMPOSITIONS,
  FORBIDDEN_FAN_LOBBY_COMPOSITIONS,
  FORBIDDEN_GAME_SHOW_COMPOSITIONS,
  FORBIDDEN_LOUNGE_COMPOSITIONS,
  FORBIDDEN_MNS_COMPOSITIONS,
  FORBIDDEN_RELEASE_COMPOSITIONS,
  VS_COMPOSITIONS,
} from "./types";
import { ALL_PACKS } from "./packs";

export interface ExperiencePresentationPack {
  packId: ExperiencePackId;
  /** Human DNA one-liner */
  signatureDna: string;
  presenceModel: PresenceModel;
  allowedCompositions: BroadcastCompositionLayout[];
  forbiddenCompositions: BroadcastCompositionLayout[];
  requiredPrimitives: PresentationPrimitiveKind[];
  optionalPrimitives: PresentationPrimitiveKind[];
  /** Semantic flags enforced by tests */
  allowsVsLayout: boolean;
  allowsWinnerFinale: boolean;
  allowsEliminationFinale: boolean;
  prefersChallengeContract: boolean;
  /** Monday Night Stage must not alias Regular GO LIVE */
  isRegularGoLive: boolean;
  routeCapability: RouteCapabilityContract;
}

export interface ExperiencePresentationDirector {
  getPack(packId: ExperiencePackId): ExperiencePresentationPack;
  listPacks(): ExperiencePresentationPack[];
  assertCompositionAllowed(
    packId: ExperiencePackId,
    layout: BroadcastCompositionLayout
  ): void;
}

export function getPresentationPack(packId: ExperiencePackId): ExperiencePresentationPack {
  const pack = ALL_PACKS[packId];
  if (!pack) {
    throw new Error(`Unknown presentation pack: ${packId}`);
  }
  return pack;
}

export function listPresentationPacks(): ExperiencePresentationPack[] {
  return Object.values(ALL_PACKS);
}

export function assertPackAllowsComposition(
  packId: ExperiencePackId,
  layout: BroadcastCompositionLayout
): void {
  const pack = getPresentationPack(packId);

  if (pack.forbiddenCompositions.includes(layout)) {
    throw new Error(`${packId} forbids composition ${layout}`);
  }
  if (!pack.allowedCompositions.includes(layout)) {
    throw new Error(`${packId} does not allow composition ${layout}`);
  }

  // Hard semantic: Cypher never VS / winner / elimination path via composition
  if (packId === "Cypher") {
    if ((FORBIDDEN_CYPHER_COMPOSITIONS as readonly string[]).includes(layout)) {
      throw new Error("Cypher pack rejects VS/winner layouts");
    }
    if ((VS_COMPOSITIONS as readonly string[]).includes(layout)) {
      throw new Error("Cypher pack rejects VS / dual combat compositions");
    }
    if (pack.allowsVsLayout || pack.allowsWinnerFinale || pack.allowsEliminationFinale) {
      throw new Error("Cypher pack semantic flags forbid VS/winner/elimination");
    }
  }

  // Hard semantic: Lounge never avatar presence (checked on pack.presenceModel elsewhere)
  if (packId === "Lounge") {
    if (pack.presenceModel !== "WEBRTC_PANELS") {
      throw new Error("Lounge pack rejects avatar presence model");
    }
    if ((FORBIDDEN_LOUNGE_COMPOSITIONS as readonly string[]).includes(layout)) {
      throw new Error("Lounge pack rejects Battle VS / Cypher / Game Show / floor-avatar compositions");
    }
    if (pack.allowsVsLayout || pack.allowsWinnerFinale || pack.allowsEliminationFinale) {
      throw new Error("Lounge pack semantic flags forbid VS/winner/elimination");
    }
  }

  // Hard semantic: Fan Lobby / FanLive = social hangout — never Battle VS / Cypher / Game Show / WDP floor
  if (packId === "FanLive") {
    if (pack.presenceModel !== "FAN_AVATARS" && pack.presenceModel !== "MIXED_SOCIAL") {
      throw new Error("FanLive pack must authorize fan avatar / social presence");
    }
    if ((FORBIDDEN_FAN_LOBBY_COMPOSITIONS as readonly string[]).includes(layout)) {
      throw new Error("FanLive pack rejects Battle VS / Cypher / Game Show / WDP floor compositions");
    }
    if (pack.allowsVsLayout || pack.allowsWinnerFinale || pack.allowsEliminationFinale) {
      throw new Error("FanLive pack semantic flags forbid VS/winner/elimination");
    }
  }

  // Battle must be able to accept at least one VS composition
  if (packId === "Battle" && pack.allowsVsLayout === false) {
    throw new Error("Battle pack must allow VS");
  }

  if (
    packId === "Challenge" &&
    (VS_COMPOSITIONS as readonly string[]).includes(layout) &&
    layout !== "SPLIT"
  ) {
    // Challenge may use SPLIT for host/guest moments but not DUAL corner VS as signature
    if (layout === "DUAL" || layout === "A_DOMINANT" || layout === "B_DOMINANT") {
      throw new Error("Challenge pack prefers contract/objective — rejects corner VS as primary");
    }
  }

  // Hard semantic: Concert / World Concert never Battle VS corners or Cypher circle
  if (packId === "Concert" || packId === "WorldConcert") {
    if ((FORBIDDEN_CONCERT_COMPOSITIONS as readonly string[]).includes(layout)) {
      throw new Error(`${packId} pack rejects Battle VS / Cypher circle compositions`);
    }
    if (pack.allowsVsLayout || pack.allowsWinnerFinale || pack.allowsEliminationFinale) {
      throw new Error(`${packId} pack semantic flags forbid VS/winner/elimination`);
    }
  }

  // Hard semantic: Dance Party / WDP never Battle VS corners or Cypher circle combat
  if (packId === "DanceParty") {
    if ((FORBIDDEN_DANCE_PARTY_COMPOSITIONS as readonly string[]).includes(layout)) {
      throw new Error("DanceParty pack rejects Battle VS / Cypher circle / objective-board compositions");
    }
    if (pack.allowsVsLayout || pack.allowsWinnerFinale || pack.allowsEliminationFinale) {
      throw new Error("DanceParty pack semantic flags forbid VS/winner/elimination");
    }
  }

  // Hard semantic: Monday Night Stage ≠ Regular GO LIVE; never Battle VS / Cypher circle
  if (packId === "MondayNightStage") {
    if (pack.isRegularGoLive) {
      throw new Error("MondayNightStage pack must not alias Regular GO LIVE");
    }
    if ((FORBIDDEN_MNS_COMPOSITIONS as readonly string[]).includes(layout)) {
      throw new Error("MondayNightStage pack rejects Battle VS / Cypher circle compositions");
    }
    if (pack.allowsVsLayout || pack.allowsWinnerFinale || pack.allowsEliminationFinale) {
      throw new Error("MondayNightStage pack semantic flags forbid VS/winner/elimination");
    }
  }

  // Hard semantic: World / Mini Release = premiere — never Battle VS / Cypher circle / game board
  if (packId === "WorldRelease") {
    if (pack.isRegularGoLive) {
      throw new Error("WorldRelease pack must not alias Regular GO LIVE");
    }
    if ((FORBIDDEN_RELEASE_COMPOSITIONS as readonly string[]).includes(layout)) {
      throw new Error("WorldRelease pack rejects Battle VS / Cypher circle / game-board compositions");
    }
    if (pack.allowsVsLayout || pack.allowsWinnerFinale || pack.allowsEliminationFinale) {
      throw new Error("WorldRelease pack semantic flags forbid VS/winner/elimination");
    }
  }

  // Hard semantic: Game Show = board/host — never Battle VS corners / Cypher circle
  if (packId === "GameShow") {
    if (pack.isRegularGoLive) {
      throw new Error("GameShow pack must not alias Regular GO LIVE");
    }
    if ((FORBIDDEN_GAME_SHOW_COMPOSITIONS as readonly string[]).includes(layout)) {
      throw new Error("GameShow pack rejects Battle VS / Cypher circle compositions");
    }
    if (pack.allowsVsLayout) {
      throw new Error("GameShow pack semantic flags forbid VS layout");
    }
  }
}

export function createPresentationDirector(): ExperiencePresentationDirector {
  return {
    getPack: getPresentationPack,
    listPacks: listPresentationPacks,
    assertCompositionAllowed: assertPackAllowsComposition,
  };
}
