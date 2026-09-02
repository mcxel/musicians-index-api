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
import { FORBIDDEN_CYPHER_COMPOSITIONS, VS_COMPOSITIONS } from "./types";
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
  if (packId === "Lounge" && pack.presenceModel !== "WEBRTC_PANELS") {
    throw new Error("Lounge pack rejects avatar presence model");
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
}

export function createPresentationDirector(): ExperiencePresentationDirector {
  return {
    getPack: getPresentationPack,
    listPacks: listPresentationPacks,
    assertCompositionAllowed: assertPackAllowsComposition,
  };
}
