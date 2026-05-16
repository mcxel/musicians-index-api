/**
 * Phase 1 Launch Config — Controlled Public Onboarding
 * Defines ONLY the bots and services that are active during Phase 1.
 * Everything outside this config stays OFF until Phase 2 is authorized.
 */

// ─── Phase gate ───────────────────────────────────────────────────────────────

export type LaunchPhase = "phase-1-controlled" | "phase-2-open" | "phase-3-scale";

export const CURRENT_PHASE: LaunchPhase = "phase-1-controlled";

// Hard guard — prevents accidental full-swarm activation
export function assertPhase1(): void {
  if (CURRENT_PHASE !== "phase-1-controlled") {
    throw new Error(`[Phase1LaunchConfig] Phase guard failed — current phase is ${CURRENT_PHASE}`);
  }
}

// ─── Bot activation manifest ─────────────────────────────────────────────────

export interface Phase1BotManifest {
  welcomeBot: boolean;
  ghostForceDrip: boolean;        // BotDripEmitter — max 3 bots per room
  silentModeration: boolean;      // botModerationEngine — log only
  loggingSentinel: boolean;       // ShadowSentinelDiagnosticRegistry
  // Everything below is Phase 2+
  fullBotSwarm: false;
  populationSimulator: false;
  auctionBots: false;
  nftMintBots: false;
}

export const PHASE_1_BOTS: Phase1BotManifest = {
  welcomeBot: true,
  ghostForceDrip: true,
  silentModeration: true,
  loggingSentinel: true,
  // Phase 2+ — locked off
  fullBotSwarm: false,
  populationSimulator: false,
  auctionBots: false,
  nftMintBots: false,
};

// ─── Room activation ─────────────────────────────────────────────────────────

/** Only these rooms are open for Phase 1 entry */
export const PHASE_1_ACTIVE_ROOMS = [
  "world-dance-party",
  "world-concert",
  "cypher",
  "lobby",
] as const;

export type Phase1ActiveRoom = (typeof PHASE_1_ACTIVE_ROOMS)[number];

export function isRoomActivePhase1(roomId: string): boolean {
  return (PHASE_1_ACTIVE_ROOMS as readonly string[]).includes(roomId);
}

// ─── Ghost Force limits ───────────────────────────────────────────────────────

/** Phase 1 max ghost bots per room (override for BotDripEmitter's default of 3) */
export const PHASE_1_GHOST_BOT_MAX = 2;

/** First bot arrival window — slightly faster for Phase 1 to seed the room quickly */
export const PHASE_1_FIRST_BOT_DELAY_MS: [number, number] = [20_000, 45_000];

// ─── Monitoring thresholds ───────────────────────────────────────────────────

export const PHASE_1_ALERT_THRESHOLDS = {
  /** Alert if signup error rate exceeds this fraction in a rolling window */
  signupErrorRate: 0.1,
  /** Alert if Stripe checkout attempts with no completion exceed this count */
  stripeAbandonCount: 5,
  /** Alert if a room has had 0 new joins for this many ms */
  roomStaleMs: 300_000, // 5 minutes
};

// ─── Feature flags ───────────────────────────────────────────────────────────

export const PHASE_1_FLAGS = {
  /** Allow real users to sign up */
  signupEnabled: true,
  /** Allow all 4 user roles to onboard */
  allRolesEnabled: true,
  /** Payment pages accessible */
  paymentsEnabled: true,
  /** Ticket printing — Phase 2 */
  ticketPrintingEnabled: false,
  /** NFT minting — Phase 2 */
  nftMintingEnabled: false,
  /** Beat auction — Phase 2 */
  beatAuctionEnabled: false,
} as const;
