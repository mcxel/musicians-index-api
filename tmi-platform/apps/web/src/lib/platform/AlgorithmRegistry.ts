/**
 * AlgorithmRegistry — register algorithms that already exist in code.
 * Prefer omit over fake CERTIFIED. DRAFT only when purpose is documented
 * without a callable entrypoint.
 */

import type { CertificationStatus } from "@/lib/mainframe/types";

export interface AlgorithmDefinition {
  id: string;
  name: string;
  version: string;
  owner: string;
  purpose: string;
  domain: string;
  inputs: string[];
  outputs: string[];
  /** Module path relative to apps/web/src */
  sourceModule: string;
  /** Exported symbol name — must exist for CERTIFIED/TESTING */
  entrypoint: string;
  eventsConsumed?: string[];
  eventsEmitted?: string[];
  certificationStatus?: CertificationStatus;
  notes?: string;
}

const ALGORITHMS: AlgorithmDefinition[] = [
  {
    id: "compute-ranks",
    name: "XP-driven performer rank computation",
    version: "1.0.0",
    owner: "Ranking Engine",
    purpose: "Compute performer ranks from XP/engagement — never manual rank writes (Rule 3).",
    domain: "scores-ranking",
    inputs: ["PerformerIdentity[]", "xp", "engagement signals"],
    outputs: ["ranked PerformerIdentity[]"],
    sourceModule: "lib/performers/PerformerRegistry.ts",
    entrypoint: "computeRanks",
    certificationStatus: "CERTIFIED",
  },
  {
    id: "crown-rotation-status",
    name: "Crown rotation expiry check",
    version: "1.0.0",
    owner: "Ranking Engine",
    purpose: "Check overall/genre crown hold windows (Rule 4).",
    domain: "scores-ranking",
    inputs: ["crownSince", "PerformerIdentity"],
    outputs: ["holder", "daysHeld", "rotationDue"],
    sourceModule: "lib/performers/PerformerRegistry.ts",
    entrypoint: "getCrownRotationStatus",
    certificationStatus: "CERTIFIED",
  },
  {
    id: "sort-by-freshness",
    name: "Content freshness sort",
    version: "1.0.0",
    owner: "Content Engine",
    purpose: "LIVE → RECENT → POPULAR → ARCHIVE ordering (Rule 11).",
    domain: "discovery",
    inputs: ["items with freshness signals"],
    outputs: ["sorted items"],
    sourceModule: "lib/content/ContentFreshness.ts",
    entrypoint: "sortByFreshness",
    certificationStatus: "CERTIFIED",
  },
  {
    id: "beat-exclusivity-check",
    name: "Beat exclusive-sale gate",
    version: "1.0.0",
    owner: "Beat Systems",
    purpose:
      "Prevent exclusively sold marketplace beats from remaining usable in competitions (Rule 19).",
    domain: "beat-locker",
    inputs: ["beatId"],
    outputs: ["boolean isExclusive"],
    sourceModule: "lib/beats/BeatInventoryEngine.ts",
    entrypoint: "isBeatExclusivelySold",
    certificationStatus: "CERTIFIED",
  },
  {
    id: "ad-slot-fallback-chain",
    name: "Ad/sponsor zone fallback",
    version: "1.0.0",
    owner: "Commerce",
    purpose: "Paid → Platform → AdNetwork → Advertise CTA (Rule 12).",
    domain: "commerce-marketplace",
    inputs: ["zone id"],
    outputs: ["AdSlotDescriptor"],
    sourceModule: "lib/commerce/SponsorRegistry.ts",
    entrypoint: "getAdSlotForZone",
    certificationStatus: "CERTIFIED",
  },
  {
    id: "assign-seat-for-fan",
    name: "Fan avatar seat assignment",
    version: "1.0.0",
    owner: "Audience Runtime",
    purpose: "Assign a seat for a fan joining a venue/room.",
    domain: "fan-lobby",
    inputs: ["fanId", "room/venue context"],
    outputs: ["seat assignment"],
    sourceModule: "lib/audience/tmiFanAvatarSeatAssignment.ts",
    entrypoint: "assignSeatForFan",
    certificationStatus: "TESTING",
    notes: "One of several seat systems — canonical convergence ongoing (Rule 21).",
  },
  {
    id: "join-audience",
    name: "Canonical audience join",
    version: "1.0.0",
    owner: "Audience Runtime",
    purpose: "Join audience membership for a venue slug via audienceRuntimeEngine.",
    domain: "fan-lobby",
    inputs: ["venueSlug", "member"],
    outputs: ["audience membership / seat"],
    sourceModule: "lib/live/audienceRuntimeEngine.ts",
    entrypoint: "joinAudience",
    certificationStatus: "TESTING",
  },
  {
    id: "seating-mesh-claim",
    name: "Seating mesh seat claim",
    version: "1.0.0",
    owner: "Seating Mesh",
    purpose: "Persistent seat claim with reclaim-on-return capability.",
    domain: "fan-lobby",
    inputs: ["roomId", "seatId", "user"],
    outputs: ["claimed seat state"],
    sourceModule: "lib/seats/SeatingMeshEngine.ts",
    entrypoint: "claimSeat",
    certificationStatus: "TESTING",
  },
  {
    id: "bot-crowd-fill",
    name: "Progressive stadium bot fill",
    version: "1.0.0",
    owner: "Live / Audience",
    purpose: "Progressive seat fill to max 92% with bot sit-ins (Rule 15).",
    domain: "broadcast",
    inputs: ["roomId", "occupancy config"],
    outputs: ["occupancyRatio / bot occupants"],
    sourceModule: "lib/live/BotCrowdFillEngine.ts",
    entrypoint: "botCrowdFillEngine",
    certificationStatus: "TESTING",
  },
  {
    id: "broadcast-shot-profile",
    name: "Broadcast director shot selection",
    version: "2.0.0",
    owner: "Broadcast Engine",
    purpose: "Context-aware camera shot probabilities by room type (Rule 16).",
    domain: "broadcast",
    inputs: ["BroadcastContext", "roomType"],
    outputs: ["BroadcastShot"],
    sourceModule: "lib/live/BroadcastDirectorEngine.ts",
    entrypoint: "getNextBroadcastShot",
    certificationStatus: "CERTIFIED",
  },
  {
    id: "battle-pack-phase-resolve",
    name: "Battle pack event → phase",
    version: "1.0.0",
    owner: "Presentation Framework",
    purpose: "Resolve PresentationSemanticEvent to Battle Pack phase.",
    domain: "presentation",
    inputs: ["PresentationSemanticEvent"],
    outputs: ["BattlePackPhase | null"],
    sourceModule: "lib/presentation/packs/BattlePresentationPackV1.ts",
    entrypoint: "resolveBattlePhaseFromEvent",
    certificationStatus: "CERTIFIED",
  },
  {
    id: "show-package-handle-event",
    name: "Show package director resolve",
    version: "1.0.0",
    owner: "Presentation Framework",
    purpose: "Semantic event → active show package snapshot + overlays.",
    domain: "presentation",
    inputs: ["PresentationSemanticEvent", "payload"],
    outputs: ["ActiveShowPackageSnapshot"],
    sourceModule: "lib/presentation/ShowPackageDirector.ts",
    entrypoint: "ShowPackageDirector.handleEvent",
    certificationStatus: "CERTIFIED",
  },
];

const BY_ID = new Map(ALGORITHMS.map((a) => [a.id, a]));

export function listAlgorithms(): AlgorithmDefinition[] {
  return [...ALGORITHMS];
}

export function getAlgorithm(id: string): AlgorithmDefinition | undefined {
  return BY_ID.get(id);
}

export function listAlgorithmsByDomain(domain: string): AlgorithmDefinition[] {
  return ALGORITHMS.filter((a) => a.domain === domain);
}

export const AlgorithmRegistry = {
  list: listAlgorithms,
  get: getAlgorithm,
  byDomain: listAlgorithmsByDomain,
};

export default AlgorithmRegistry;
