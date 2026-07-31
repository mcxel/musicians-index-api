/**
 * ShowPackCatalog — indexes Battle / Cypher / Challenge packs.
 * ShowPackageDirector selects active pack from here; no second director.
 */

import { BATTLE_PRESENTATION_PACK_V1 } from "./packs/BattlePresentationPackV1";
import { CYPHER_PRESENTATION_PACK_V1 } from "./packs/CypherPresentationPackV1";
import { CHALLENGE_PRESENTATION_PACK_V1 } from "./packs/ChallengePresentationPackV1";
import type { ShowPackDefinition, ShowPackPhase } from "./ShowPackTypes";
import type { PresentationSemanticEvent } from "./PresentationEvents";

function battleAsShowPack(): ShowPackDefinition {
  const grammar = BATTLE_PRESENTATION_PACK_V1.grammar as unknown as string[];
  const phases: Record<string, ShowPackPhase> = {};
  for (const id of BATTLE_PRESENTATION_PACK_V1.grammar) {
    const p = BATTLE_PRESENTATION_PACK_V1.phases[id];
    phases[id] = {
      phaseId: p.phaseId,
      label: p.label,
      triggerEvent: p.triggerEvent,
      previewHoldMs: p.previewHoldMs,
      surfaces: p.surfaces,
      cameraCue: p.cameraCue,
      legacyPackageId: p.legacyPackageId,
    };
  }
  return {
    packId: BATTLE_PRESENTATION_PACK_V1.packId,
    name: BATTLE_PRESENTATION_PACK_V1.name,
    description: BATTLE_PRESENTATION_PACK_V1.description,
    category: "BATTLE",
    grammar,
    phases,
    eventMap: BATTLE_PRESENTATION_PACK_V1.eventMap as ShowPackDefinition["eventMap"],
  };
}

const CATALOG: Record<string, ShowPackDefinition> = {
  "battle-presentation-v1": battleAsShowPack(),
  "cypher-presentation-v1": CYPHER_PRESENTATION_PACK_V1,
  "challenge-presentation-v1": CHALLENGE_PRESENTATION_PACK_V1,
};

export function listShowPacks(): ShowPackDefinition[] {
  return Object.values(CATALOG);
}

export function getShowPack(packId: string): ShowPackDefinition | undefined {
  return CATALOG[packId];
}

export function resolvePhaseFromPack(
  packId: string,
  event: PresentationSemanticEvent
): ShowPackPhase | null {
  const pack = CATALOG[packId];
  if (!pack) return null;
  const phaseId = pack.eventMap[event];
  if (!phaseId) return null;
  return pack.phases[phaseId] ?? null;
}

export const DEFAULT_SHOW_PACK_ID = "battle-presentation-v1";

export const ShowPackCatalog = {
  list: listShowPacks,
  get: getShowPack,
  resolvePhase: resolvePhaseFromPack,
  defaultPackId: DEFAULT_SHOW_PACK_ID,
};

export default ShowPackCatalog;
