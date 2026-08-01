/**
 * beatLockerRegistry — TMI Beat Ecosystem Constitution v1.0 (locked 2026-08-01).
 *
 * Every beat inside the platform is a LIVING DIGITAL ASSET — not just an audio file.
 * It has its own identity, lifecycle status, genome fingerprint, placement pools,
 * commercial tiers, provenance timeline, and analytics profile.
 *
 * Three-Tier Pipeline:
 *   Submission Center (creator workspace)
 *     → Beat Locker (automated operations + human review)
 *       → Beat Marketplace (commercial showcase)
 *
 * Founding Beat Creators (Phase A — internal test team):
 *   Marcel (Marcel & Creech catalog — 200+ instrumentals)
 *   Todd Morrissey (battle/cypher specialist)
 *   J. Paul Sanchez (BJM — beat review + placement lead)
 */

// ─── Beat Lifecycle Status ─────────────────────────────────────────────────────

export type BeatStatus =
  | "DRAFT"                // Creator is still editing — not yet submitted
  | "PENDING_CERTIFICATION" // Submitted, awaiting automated certification bots
  | "CERTIFYING"           // Audio Certification Bot is actively processing
  | "NEEDS_REVISION"       // Failed certification or returned by reviewer with comments
  | "CERTIFIED"            // Passed all automated checks; queued for AI classification
  | "IN_REVIEW"            // In a human reviewer's queue (Beat Reviewer role)
  | "APPROVED"             // Approved; awaiting sandbox validation
  | "SANDBOX"              // Live in internal staff-only events for final validation
  | "LIVE"                 // Fully published — appears in competition pools and marketplace
  | "FEATURED"             // Curated spotlight — promoted placement in rotation
  | "ARCHIVED"             // Removed from active pools; preserved for analytics and timeline
  | "RETIRED";             // Permanently withdrawn; canonical ID still exists for audit

// ─── Placement Pools ──────────────────────────────────────────────────────────

export type BeatPlacementPool =
  | "beat_battles"         // 1v1 and tournament-format rap/vocal battles
  | "freestyle_battles"    // Unscripted improvised rap battles
  | "dance_battles"        // Choreography competition format
  | "cyphers"              // Open-mic circle format (multiple performers)
  | "dance_challenges"     // Solo challenge / trending challenge format
  | "world_dance_parties"  // Global synchronized dance events
  | "listening_rooms"      // Curated ambient listening sessions
  | "radio_rotation"       // Platform radio queue
  | "practice_arena"       // Private rehearsal rooms
  | "tutorial_events"      // Educational / instructional format
  | "world_concerts"       // Large-scale virtual venue concerts
  | "marketplace";         // Commercial sale and licensing

// ─── Energy & Mood ────────────────────────────────────────────────────────────

export type BeatEnergyLevel =
  | "SLOW"        // Under 75 BPM; introspective, meditative
  | "MEDIUM"      // 76–95 BPM; conversational, smooth
  | "HIGH"        // 96–115 BPM; energetic, crowd-moving
  | "AGGRESSIVE"  // 116+ BPM or heavy-hitting regardless of tempo
  | "EMOTIONAL"   // Emphasis on melody and vulnerability
  | "DARK"        // Minor key, brooding, atmospheric
  | "HAPPY"       // Major key, uplifting, celebratory
  | "CLUB"        // 4/4 kick-driven, designed for dance floors
  | "WORKOUT"     // Driving, repetitive, endurance-focused
  | "ROMANTIC"    // Smooth, soulful, intimate
  | "EPIC";       // Cinematic, orchestral, grand in scale

export type BeatMood =
  | "aggressive" | "calm" | "celebratory" | "dark" | "dramatic"
  | "emotional" | "energetic" | "epic" | "happy" | "inspirational"
  | "melancholy" | "nostalgic" | "playful" | "romantic" | "smooth"
  | "spiritual" | "triumphant" | "uneasy" | "uplifting" | "urban";

// ─── Genre ────────────────────────────────────────────────────────────────────

export type BeatGenre =
  | "hip_hop" | "trap" | "boom_bap" | "drill" | "rnb" | "soul"
  | "pop" | "electronic" | "house" | "afrobeats" | "reggae"
  | "dancehall" | "latin" | "gospel" | "jazz" | "blues"
  | "rock" | "orchestral" | "ambient" | "lo_fi" | "world"
  | "spoken_word" | "kids" | "comedy" | "hybrid";

// ─── License Types ────────────────────────────────────────────────────────────

export type BeatLicenseType =
  | "STANDARD"    // Non-exclusive; unlimited buyers; personal and limited commercial use
  | "LIMITED"     // Non-exclusive; finite buyer cap (e.g. max 25 licenses)
  | "COMMERCIAL"  // Full commercial rights; non-exclusive
  | "EXCLUSIVE"   // One buyer; removed from market after sale
  | "LIVE_AUCTION"; // Real-time bidding during a live event (producer-enabled only)

// ─── Beat Genome (Fingerprint) ────────────────────────────────────────────────

/**
 * BeatGenome is the Living OS audio fingerprint for a beat.
 * AI fills this automatically post-certification; creators can review + override.
 * The Genome drives the Distribution Engine's placement recommendations.
 */
export interface BeatGenome {
  /** Estimated BPM (floating point for half-time/double-time detection). */
  estimatedBpm: number;
  /** Detected musical key (e.g. "Am", "C#maj"). */
  musicalKey: string;
  /** Primary genre. */
  genre: BeatGenre;
  /** Additional genre tags (up to 3). */
  secondaryGenres: BeatGenre[];
  /** Mood tags. */
  moods: BeatMood[];
  /** Single primary energy level. */
  energyLevel: BeatEnergyLevel;
  /** 0–1 scale: how suitable for freestyle/spoken performance. */
  freestyleSuitability: number;
  /** 0–1 scale: how suitable for dance events. */
  danceability: number;
  /** 0–1 scale: crowd singalong/hook potential. */
  crowdHookPotential: number;
  /** Intro length before main beat drops (seconds). */
  introLengthSeconds: number;
  /** Outro length after main beat ends (seconds). */
  outroLengthSeconds: number;
  /** Loop quality (0–1): how cleanly it cycles without audible seam. */
  loopQuality: number;
  /** AI confidence in these suggestions (0–1). Lower = needs human review. */
  confidenceScore: number;
  /** Battle suitability rating (1–5 stars). */
  battleRating: 1 | 2 | 3 | 4 | 5;
  /** Cypher suitability rating (1–5 stars). */
  cypherRating: 1 | 2 | 3 | 4 | 5;
  /** Dance event suitability rating (1–5 stars). */
  danceRating: 1 | 2 | 3 | 4 | 5;
  /** Listening room suitability rating (1–5 stars). */
  listeningRoomRating: 1 | 2 | 3 | 4 | 5;
}

// ─── Split Sheet ──────────────────────────────────────────────────────────────

export interface RoyaltySplit {
  /** Platform display name for the royalty recipient (not a userId — for audit logs). */
  recipientName: string;
  /** Platform user account ID. */
  accountId: string;
  /** Percentage of net revenue (must sum to 100 across all splits). */
  percentage: number;
  /** Role of this recipient in the production (e.g. "Producer", "Co-Producer"). */
  role: string;
}

// ─── Beat Identity (canonical beat object) ────────────────────────────────────

/**
 * BeatIdentity is the authoritative record for a beat inside the Living OS.
 * Stored as structured data — the audio file is a separate asset reference.
 *
 * Canonical ID (e.g. B-00084571) is permanent and never changes.
 * Display name must be unique among LIVE beats in the same catalog tier.
 */
export interface BeatIdentity {
  /** Permanent system ID. Never changes even if the beat is retired. Format: B-XXXXXXXX */
  canonicalId: string;
  /** Human-visible title. Unique among active LIVE beats. */
  displayName: string;
  /** Primary producer's platform account ID. */
  primaryProducerAccountId: string;
  /** Display name for broadcasts and marketplace (e.g. "Marcel & Creech"). */
  producerCredit: string;
  /** Full royalty split sheet. Percentages must sum to 100. */
  royaltySplits: RoyaltySplit[];
  /** Current pipeline status. */
  status: BeatStatus;
  /** Placement pools this beat is eligible for. */
  eligiblePools: BeatPlacementPool[];
  /** Competition eligibility flags for fast routing. */
  competitionEligible: {
    battles: boolean;
    cyphers: boolean;
    challenges: boolean;
    danceParties: boolean;
    worldConcerts: boolean;
    listeningRooms: boolean;
    radio: boolean;
    marketplace: boolean;
  };
  /** AI-generated + creator-approved fingerprint. */
  genome?: BeatGenome;
  /** Optional custom cover art asset ID. */
  artworkAssetId?: string;
  /** Audio file asset ID (high-resolution master). */
  audioAssetId: string;
  /** Total duration in seconds. */
  durationSeconds: number;
  /** Loudness in LUFS (measured post-certification). */
  loudnessLufs?: number;
  /** License configuration set by producer. */
  licenseType: BeatLicenseType;
  /** Price in USD (for STANDARD, LIMITED, COMMERCIAL, EXCLUSIVE licenses). */
  priceUsd?: number;
  /** Remaining license slots (for LIMITED license type). */
  remainingLicenses?: number;
  /** Whether live auction is enabled by the producer. */
  auctionEnabled: boolean;
  /** ISO timestamp of initial submission. */
  submittedAt: string;
  /** ISO timestamp of approval. */
  approvedAt?: string;
  /** ISO timestamp when beat first went LIVE. */
  publishedAt?: string;
  /** ISO timestamp of retirement. */
  retiredAt?: string;
  /** Human reviewer notes (visible to creator on revision). */
  reviewerNotes?: string;
}

// ─── Beat Submission Form ─────────────────────────────────────────────────────

/** What the creator fills out in the Submission Center drawer. */
export interface BeatSubmission {
  displayName: string;
  producerCredit: string;
  description?: string;
  genre: BeatGenre;
  secondaryGenres?: BeatGenre[];
  moods?: BeatMood[];
  energyLevel?: BeatEnergyLevel;
  competitionEligible: Partial<BeatIdentity["competitionEligible"]>;
  licenseType: BeatLicenseType;
  priceUsd?: number;
  remainingLicenses?: number;
  auctionEnabled?: boolean;
  rightsConfirmed: boolean;
  royaltySplits: RoyaltySplit[];
}

// ─── Provenance Event ─────────────────────────────────────────────────────────

export type BeatProvenanceEventType =
  | "SUBMITTED" | "CERTIFIED" | "APPROVED" | "PUBLISHED"
  | "PLAYED_IN_BATTLE" | "PLAYED_IN_CYPHER" | "PLAYED_IN_CHALLENGE"
  | "PLAYED_IN_DANCE_PARTY" | "PLAYED_IN_CONCERT" | "PLAYED_ON_RADIO"
  | "FEATURED" | "FAVORITED" | "PREVIEWED"
  | "LICENSE_PURCHASED" | "EXCLUSIVE_SOLD" | "AUCTIONED"
  | "ROYALTY_PAID" | "NEEDS_REVISION" | "RETIRED";

export interface BeatProvenanceEvent {
  type: BeatProvenanceEventType;
  timestamp: string;
  /** Human-readable context (e.g. "Friday Night Battle — MarcelD vs. QueenV"). */
  context?: string;
  /** Canonical Beat ID for cross-reference. */
  beatId: string;
}

// ─── Bot Team Responsibilities ────────────────────────────────────────────────

/**
 * The Beat Locker bot team operates autonomously behind the creator's view.
 * Each bot has a single responsibility following the Single Responsibility Principle.
 */
export type BeatLockerBotRole =
  | "AUDIO_CERTIFICATION_BOT"  // File integrity, loudness, clipping, corruption, silence
  | "GENRE_INTELLIGENCE_BOT"   // BPM, key, genre, mood, energy detection
  | "PLACEMENT_BOT"            // Competition pool eligibility assignment
  | "COPYRIGHT_BOT"            // Duplicate detection, ownership verification
  | "ROTATION_BOT"             // Frequency, priority, regional placement logic
  | "REVENUE_BOT"              // Pricing suggestions, license tier setup, royalty routing
  | "GENOME_BOT";              // Full Beat Genome fingerprint generation

export interface BeatLockerBotTask {
  botRole: BeatLockerBotRole;
  beatId: string;
  status: "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "SKIPPED";
  startedAt?: string;
  completedAt?: string;
  findings?: string;
}

// ─── Founding Beat Creator Registry ──────────────────────────────────────────

/**
 * Founding Beat Creators are the Phase A internal test team.
 * These are PLATFORM ROLES — not raw user records.
 * Actual user accounts are managed by the auth system.
 *
 * All three have the `beat_creator` platform role granted at account creation.
 * They are the initial validators for every step of the Beat Locker pipeline.
 */
export type FoundingBeatCreatorId =
  | "FOUNDING_MARCEL"
  | "FOUNDING_TODD_MORRISSEY"
  | "FOUNDING_J_PAUL_SANCHEZ";

export interface FoundingBeatCreatorDef {
  id: FoundingBeatCreatorId;
  platformDisplayName: string;
  /** Co-producer credit as it appears on beat cards and marketplace. */
  producerCredit: string;
  /** Primary focus within the pipeline. */
  primaryRole: "creator" | "reviewer" | "placement_lead";
  /** Phase A responsibilities. */
  responsibilities: string[];
  /** Beat catalog they're bringing to Phase A testing. */
  initialCatalogNote: string;
  /** Genres their catalog primarily covers. */
  primaryGenres: BeatGenre[];
  /** Account tier (separate from beat_creator contributor role). */
  memberTier: "diamond_lifetime" | "diamond" | "gold";
  /** Whether they have batch ingestion access for Phase A. */
  batchIngestionEnabled: boolean;
}

export const FOUNDING_BEAT_CREATORS: Record<
  FoundingBeatCreatorId,
  FoundingBeatCreatorDef
> = {
  FOUNDING_MARCEL: {
    id: "FOUNDING_MARCEL",
    platformDisplayName: "Marcel",
    producerCredit: "Marcel & Creech",
    primaryRole: "creator",
    responsibilities: [
      "Initial catalog ingestion (200+ instrumentals)",
      "Multi-genre schema tag validation",
      "Bulk metadata ingestion testing",
      "Beat Locker UI/UX validation as primary creator account",
      "Bot learning dataset — benchmark catalog",
    ],
    initialCatalogNote:
      "200+ instrumentals co-produced with Creech; predominantly hip-hop, " +
      "battle, cypher, and multi-genre instrumentals for Phase A validation.",
    primaryGenres: ["hip_hop", "trap", "boom_bap", "rnb", "hybrid"],
    memberTier: "diamond_lifetime",
    batchIngestionEnabled: true,
  },
  FOUNDING_TODD_MORRISSEY: {
    id: "FOUNDING_TODD_MORRISSEY",
    platformDisplayName: "Todd Morrissey",
    producerCredit: "Todd Morrissey",
    primaryRole: "creator",
    responsibilities: [
      "Battle beat submissions and certification pipeline testing",
      "Cypher beat submissions and placement testing",
      "Challenge beat testing",
      "SoundCloud catalog recovery and re-ingestion (when account access is restored)",
      "Beat replacement workflow testing (ACTION_REPLACE_BEAT)",
    ],
    initialCatalogNote:
      "Specialist battle and cypher beats. SoundCloud catalog available pending " +
      "account recovery; original files on local storage are the preferred ingestion path.",
    primaryGenres: ["hip_hop", "boom_bap", "trap", "drill"],
    memberTier: "diamond_lifetime",
    batchIngestionEnabled: true,
  },
  FOUNDING_J_PAUL_SANCHEZ: {
    id: "FOUNDING_J_PAUL_SANCHEZ",
    platformDisplayName: "J. Paul Sanchez",
    producerCredit: "J. Paul Sanchez (BJM)",
    primaryRole: "placement_lead",
    responsibilities: [
      "Human review cycles for all Phase A submissions",
      "Beat placement override testing and validation",
      "Genre accuracy and tagging quality assurance",
      "Analytics telemetry verification post-placement",
      "Reviewer queue workflow testing",
      "Phase D full-system dry run coordination",
    ],
    initialCatalogNote:
      "Beat creator and placement specialist. Acts as the primary human reviewer " +
      "for Phase A, B, and C submissions before platform opens to external producers.",
    primaryGenres: ["hip_hop", "rnb", "soul", "latin", "hybrid"],
    memberTier: "diamond_lifetime",
    batchIngestionEnabled: false,
  },
};

// ─── Reviewer Decision ────────────────────────────────────────────────────────

export type BeatReviewDecision =
  | "APPROVE"              // Move directly to APPROVED status
  | "APPROVE_WITH_TAGS"    // Approve but override genre/mood/placement tags
  | "NEEDS_REVISION"       // Return to creator with structured feedback
  | "HOLD"                 // Pause for additional verification
  | "REJECT";              // Permanent rejection with reason

export interface BeatReviewRecord {
  beatId: string;
  reviewerId: string;
  decision: BeatReviewDecision;
  timestamp: string;
  reason?: string;
  recommendation?: string;
  tagOverrides?: Partial<Pick<BeatGenome, "genre" | "moods" | "energyLevel">>;
  eligibilityOverrides?: Partial<BeatIdentity["competitionEligible"]>;
}

// ─── Certification Checklist ──────────────────────────────────────────────────

export interface BeatCertificationResult {
  beatId: string;
  passedAt?: string;
  checks: {
    fileIntegrity: boolean;
    supportedFormat: boolean;
    durationWithinLimits: boolean;
    noCorruption: boolean;
    metadataPresent: boolean;
    clippingWithinThreshold: boolean;
    loudnessNormalized: boolean;
    silenceHandled: boolean;
  };
  loudnessMeasuredLufs?: number;
  failureReasons: string[];
}

// ─── Beat Locker Beat Phase A Lifecycle ──────────────────────────────────────

/**
 * Phase constants for the internal testing roadmap.
 * Used by Observatory and admin dashboards to track pipeline maturity.
 */
export const BEAT_LOCKER_PHASES = {
  A: {
    label: "Phase A — Catalog Ingestion",
    lead: "FOUNDING_MARCEL" as FoundingBeatCreatorId,
    description:
      "Ingest Marcel & Creech initial catalog (200+). Validate multi-genre schema, " +
      "metadata overrides, and bulk ingestion via Beat Submission drawer.",
  },
  B: {
    label: "Phase B — Certification & Placement",
    lead: "FOUNDING_TODD_MORRISSEY" as FoundingBeatCreatorId,
    description:
      "Todd submits and tests battle/cypher beats through full certification " +
      "and competition placement routing.",
  },
  C: {
    label: "Phase C — Review & Analytics",
    lead: "FOUNDING_J_PAUL_SANCHEZ" as FoundingBeatCreatorId,
    description:
      "J. Paul executes review cycles, tests placement overrides, " +
      "and validates Observatory analytics telemetry.",
  },
  D: {
    label: "Phase D — Full System Dry Run",
    lead: null,
    description:
      "Full internal team test across live battles, radio rotation, " +
      "live auction commerce, and revenue tracking before public launch.",
  },
} as const;
