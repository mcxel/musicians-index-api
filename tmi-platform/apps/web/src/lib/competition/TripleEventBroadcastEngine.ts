/**
 * TripleEventBroadcastEngine.ts — Step 2B.2 Programming Diversity Core
 *
 * Server-Authoritative 15-Minute Automated Programming & Triplet Broadcast Engine.
 *
 * A/B/C are presentation seed slots for programming DIVERSITY only — not a runtime
 * cardinality ceiling. Continuous demand-driven N-instance replenishment lives in
 * ContinuousReplenishmentEngine.ts (recipeId + instanceId + instanceSequence).
 *
 * Laws & Invariants:
 * 1. Tri-Card Concurrent Pool: Exactly 3 distinct, curated matchups [A, B, C] generated per cycle
 *    as diversity seeds (not an N=3 room cap).
 * 2. Discipline Diversity: The 3 events within a cycle MUST span distinct categories/disciplines
 *    (e.g., Vocal/Rap, Instrumentalist, Creative/Comedic).
 * 3. Server-Authoritative 15:00 Countdown Clock: Global programming-cycle boundaries are strictly
 *    bound to 15-minute (900,000 ms) epoch intervals. Per-instance recruitment deadlines are owned
 *    by ContinuousReplenishmentEngine (independent openedAt/closesAt).
 * 4. Automated Rollover & Expired-Card Reaper: Expired event cards are purged from discovery surfaces
 *    the exact millisecond now >= cycleEndEpoch.
 * 5. Bounded Anti-Repetition FIFO Ring Buffer: Tracks recent categories, genres, and axes. Penalizes
 *    recently used matchups to prevent repetitive looping. Does NOT punish legitimate sibling
 *    instances spawned by ContinuousReplenishmentEngine demand elasticity.
 * 6. Music Profile Route Handoff: Distinctly tags events as acapella, beat-backed, chord-progression,
 *    or click-only with explicit performance modes (EXCLUSIVE_TURNS, TRADING_BARS, SIMULTANEOUS_SHOWDOWN, HYBRID).
 * 7. Zero Master Asset Leakage: Emits only event identifiers and authorized room routes.
 */

export const CYCLE_DURATION_MS = 15 * 60 * 1000; // 15 Minutes = 900,000 ms
export const RING_BUFFER_CAPACITY = 18;

export type PerformanceMode =
  | "EXCLUSIVE_TURNS"
  | "TRADING_BARS"
  | "SIMULTANEOUS_SHOWDOWN"
  | "HYBRID";

export type MusicalFoundation =
  | "NONE"
  | "PRIVATE_CLICK"
  | "PUBLIC_METRONOME"
  | "BEAT"
  | "CHORD_PROGRESSION"
  | "BACKING_BAND"
  | "AI_BACKING";

export interface TripletEventItem {
  id: string;
  cycleId: string;
  slot: "A" | "B" | "C";
  title: string;
  category: "Music" | "DJs" | "Producers" | "Comedy" | "Dance" | "Instrumental" | "Spoken Word";
  axis: string;
  genre: string;
  skill: string;
  instrument?: string;
  performanceMode: PerformanceMode;
  musicalFoundation: MusicalFoundation;
  isAcapella: boolean;
  bpm?: number;
  reasonCode: string;
  roomId: string;
  joinRoute: string;
  startsAt: number;
  expiresAt: number;
}

export interface BroadcastCycleState {
  cycleId: string;
  cycleIndex: number;
  cycleStartEpoch: number;
  cycleEndEpoch: number;
  timeRemainingMs: number;
  triplet: [TripletEventItem, TripletEventItem, TripletEventItem];
}

export interface ChallengeCatalogEntry {
  category: TripletEventItem["category"];
  axis: string;
  genre: string;
  skill: string;
  instrument?: string;
  performanceMode: PerformanceMode;
  musicalFoundation: MusicalFoundation;
  isAcapella?: boolean;
  defaultBpm?: number;
  titleTemplate: string;
}

export const CANONICAL_CHALLENGE_CATALOG: ChallengeCatalogEntry[] = [
  // Instrumentalist Battles
  {
    category: "Instrumental",
    axis: "Drummer vs Drummer",
    genre: "Rock / Funk",
    skill: "Drum Solo & Groove",
    instrument: "Drums",
    performanceMode: "TRADING_BARS",
    musicalFoundation: "PRIVATE_CLICK",
    defaultBpm: 120,
    titleTemplate: "Drummer vs Drummer: Trading Fours Showdown",
  },
  {
    category: "Instrumental",
    axis: "Guitar vs Guitar",
    genre: "Blues / Rock",
    skill: "Lead Soloing",
    instrument: "Guitar",
    performanceMode: "SIMULTANEOUS_SHOWDOWN",
    musicalFoundation: "CHORD_PROGRESSION",
    defaultBpm: 110,
    titleTemplate: "Guitar vs Guitar: Rock-Off Duel",
  },
  {
    category: "Instrumental",
    axis: "Bass vs Bass",
    genre: "Funk / Slap",
    skill: "Groove & Pocket",
    instrument: "Bass",
    performanceMode: "TRADING_BARS",
    musicalFoundation: "BEAT",
    defaultBpm: 104,
    titleTemplate: "Bass vs Bass: The Low-End Battle",
  },
  {
    category: "Instrumental",
    axis: "Trumpet vs Trumpet",
    genre: "Jazz / Latin",
    skill: "Brass Lead",
    instrument: "Trumpet",
    performanceMode: "TRADING_BARS",
    musicalFoundation: "CHORD_PROGRESSION",
    defaultBpm: 130,
    titleTemplate: "Trumpet vs Trumpet: High Note Cypher",
  },

  // Vocal & Genre Freestyle
  {
    category: "Music",
    axis: "Country Freestyle",
    genre: "Country",
    skill: "Acoustic Storytelling",
    instrument: "Voice",
    performanceMode: "EXCLUSIVE_TURNS",
    musicalFoundation: "CHORD_PROGRESSION",
    defaultBpm: 92,
    titleTemplate: "Country Freestyle: 3-Chord Truth Duel",
  },
  {
    category: "Music",
    axis: "Scat Jazz Battle",
    genre: "Jazz",
    skill: "Vocal Improvisation",
    instrument: "Voice",
    performanceMode: "EXCLUSIVE_TURNS",
    musicalFoundation: "CHORD_PROGRESSION",
    defaultBpm: 128,
    titleTemplate: "Scat Jazz Battle: The Bebop Vocals",
  },
  {
    category: "Music",
    axis: "Boom Bap vs Trap",
    genre: "Hip-Hop",
    skill: "Freestyle Lyricism",
    instrument: "Voice",
    performanceMode: "EXCLUSIVE_TURNS",
    musicalFoundation: "BEAT",
    defaultBpm: 90,
    titleTemplate: "Hip-Hop Freestyle: Boom Bap vs Trap",
  },
  {
    category: "Music",
    axis: "Raw Acapella",
    genre: "Spoken Word",
    skill: "Bars & Rhyme Scheme",
    instrument: "Voice",
    performanceMode: "EXCLUSIVE_TURNS",
    musicalFoundation: "NONE",
    isAcapella: true,
    titleTemplate: "Raw Acapella: No Beats, Just Bars",
  },

  // Creative, DJs & Comedy
  {
    category: "DJs",
    axis: "Vinyl vs Digital",
    genre: "Open Format",
    skill: "Turntablism & Scratching",
    instrument: "Turntables",
    performanceMode: "TRADING_BARS",
    musicalFoundation: "BEAT",
    defaultBpm: 98,
    titleTemplate: "DJ Scratch Duel: Vinyl vs Digital",
  },
  {
    category: "Producers",
    axis: "Beat Battle",
    genre: "Electronic / Hip-Hop",
    skill: "Beatmaking & Arrangement",
    instrument: "Sampler",
    performanceMode: "EXCLUSIVE_TURNS",
    musicalFoundation: "NONE",
    defaultBpm: 115,
    titleTemplate: "Producer Beat Battle: Flip The Sample",
  },
  {
    category: "Comedy",
    axis: "Joke-Off",
    genre: "Standup",
    skill: "Roast & Rapid Punchlines",
    instrument: "Voice",
    performanceMode: "EXCLUSIVE_TURNS",
    musicalFoundation: "NONE",
    isAcapella: true,
    titleTemplate: "Joke-Off: 60-Second Roast Arena",
  },
  {
    category: "Dance",
    axis: "Breakdance vs Popping",
    genre: "Funk / Electro",
    skill: "Street Dance Freestyle",
    instrument: "Body",
    performanceMode: "TRADING_BARS",
    musicalFoundation: "BEAT",
    defaultBpm: 112,
    titleTemplate: "Street Dance Faceoff: Break vs Pop",
  },
];

export class TripleEventBroadcastEngine {
  private recentAxisRingBuffer: string[] = [];
  private recentCategoryRingBuffer: string[] = [];
  private cachedCycle: BroadcastCycleState | null = null;

  /**
   * Calculates the server-authoritative 15:00 cycle boundaries aligned to system time.
   */
  public calculateCycleBoundaries(timestampMs: number = Date.now()): {
    cycleIndex: number;
    cycleStartEpoch: number;
    cycleEndEpoch: number;
    cycleId: string;
  } {
    const cycleIndex = Math.floor(timestampMs / CYCLE_DURATION_MS);
    const cycleStartEpoch = cycleIndex * CYCLE_DURATION_MS;
    const cycleEndEpoch = cycleStartEpoch + CYCLE_DURATION_MS;
    const cycleId = `cycle-${cycleIndex}`;
    return { cycleIndex, cycleStartEpoch, cycleEndEpoch, cycleId };
  }

  /**
   * Retrieves the current server-authoritative broadcast cycle and triplet [A, B, C].
   * If the previous cycle has expired, the automated reaper executes rollover.
   */
  public getCurrentCycle(timestampMs: number = Date.now()): BroadcastCycleState {
    const boundaries = this.calculateCycleBoundaries(timestampMs);

    // If cached cycle matches current boundary and is unexpired, return it
    if (
      this.cachedCycle &&
      this.cachedCycle.cycleId === boundaries.cycleId &&
      timestampMs < this.cachedCycle.cycleEndEpoch
    ) {
      return {
        ...this.cachedCycle,
        timeRemainingMs: Math.max(0, this.cachedCycle.cycleEndEpoch - timestampMs),
      };
    }

    // Rollover: Generate fresh triplet [A, B, C] for this cycle
    const triplet = this.generateTripletForCycle(
      boundaries.cycleId,
      boundaries.cycleStartEpoch,
      boundaries.cycleEndEpoch,
    );

    const cycleState: BroadcastCycleState = {
      cycleId: boundaries.cycleId,
      cycleIndex: boundaries.cycleIndex,
      cycleStartEpoch: boundaries.cycleStartEpoch,
      cycleEndEpoch: boundaries.cycleEndEpoch,
      timeRemainingMs: Math.max(0, boundaries.cycleEndEpoch - timestampMs),
      triplet,
    };

    this.cachedCycle = cycleState;
    return cycleState;
  }

  /**
   * Automated Expired-Card Reaper:
   * Given an arbitrary list of event cards, purges any card whose expiresAt <= timestamp.
   */
  public reapExpiredEvents(
    events: TripletEventItem[],
    timestampMs: number = Date.now(),
  ): TripletEventItem[] {
    return events.filter((e) => e.expiresAt > timestampMs);
  }

  /**
   * Inspects the anti-repetition FIFO history ring buffer.
   */
  public getRingBufferHistory(): { axes: string[]; categories: string[] } {
    return {
      axes: [...this.recentAxisRingBuffer],
      categories: [...this.recentCategoryRingBuffer],
    };
  }

  /**
   * Clears ring buffer history (useful for test resets).
   */
  public resetRingBuffer(): void {
    this.recentAxisRingBuffer = [];
    this.recentCategoryRingBuffer = [];
    this.cachedCycle = null;
  }

  /**
   * Generates 3 curated, diverse event cards [A, B, C] with anti-repetition memory.
   */
  private generateTripletForCycle(
    cycleId: string,
    startsAt: number,
    expiresAt: number,
  ): [TripletEventItem, TripletEventItem, TripletEventItem] {
    const slots: Array<"A" | "B" | "C"> = ["A", "B", "C"];
    const chosenEntries: ChallengeCatalogEntry[] = [];
    const usedCategoriesInCycle = new Set<string>();

    // Target 3 distinct broad categories across the 3 slots:
    // Slot A: Vocal / Rap / Song
    // Slot B: Instrumentalist
    // Slot C: Creative / DJ / Producer / Comedy / Dance
    const categoryBuckets: Array<(e: ChallengeCatalogEntry) => boolean> = [
      (e) => e.category === "Music" || e.category === "Spoken Word",
      (e) => e.category === "Instrumental",
      (e) => ["DJs", "Producers", "Comedy", "Dance"].includes(e.category),
    ];

    for (let i = 0; i < 3; i++) {
      const bucketFilter = categoryBuckets[i] || (() => true);
      const candidates = CANONICAL_CHALLENGE_CATALOG.filter(
        (e) => bucketFilter(e) && !usedCategoriesInCycle.has(e.category) && !chosenEntries.includes(e),
      );

      // Score candidates based on anti-repetition ring buffer
      const scored = candidates.map((c) => {
        let score = 100;
        const axisIndex = this.recentAxisRingBuffer.indexOf(c.axis);
        if (axisIndex !== -1) {
          // Penalize recently used axes (higher penalty if more recent)
          score -= (this.recentAxisRingBuffer.length - axisIndex) * 20;
        }
        const catIndex = this.recentCategoryRingBuffer.indexOf(c.category);
        if (catIndex !== -1) {
          score -= (this.recentCategoryRingBuffer.length - catIndex) * 10;
        }
        return { candidate: c, score };
      });

      scored.sort((a, b) => b.score - a.score);

      // Pick top scored candidate (or fallback)
      const selected = scored[0]?.candidate || candidates[0] || CANONICAL_CHALLENGE_CATALOG[i]!;
      chosenEntries.push(selected);
      usedCategoriesInCycle.add(selected.category);

      // Push into FIFO ring buffer
      this.pushToRingBuffer(selected.axis, selected.category);
    }

    const triplet = slots.map((slot, idx) => {
      const entry = chosenEntries[idx]!;
      const roomId = `room-arena-${entry.axis.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${cycleId}`;
      const item: TripletEventItem = {
        id: `ev-${cycleId}-${slot.toLowerCase()}`,
        cycleId,
        slot,
        title: entry.titleTemplate,
        category: entry.category,
        axis: entry.axis,
        genre: entry.genre,
        skill: entry.skill,
        instrument: entry.instrument,
        performanceMode: entry.performanceMode,
        musicalFoundation: entry.musicalFoundation,
        isAcapella: entry.isAcapella || false,
        bpm: entry.defaultBpm,
        reasonCode: "REPETITION_CLEAR + GENRE_ROTATION + SKILL_DIVERSITY",
        roomId,
        joinRoute: `/live/rooms/${roomId}?mode=battle&axis=${encodeURIComponent(entry.axis)}`,
        startsAt,
        expiresAt,
      };
      return item;
    }) as [TripletEventItem, TripletEventItem, TripletEventItem];

    return triplet;
  }

  private pushToRingBuffer(axis: string, category: string): void {
    this.recentAxisRingBuffer.push(axis);
    if (this.recentAxisRingBuffer.length > RING_BUFFER_CAPACITY) {
      this.recentAxisRingBuffer.shift();
    }

    this.recentCategoryRingBuffer.push(category);
    if (this.recentCategoryRingBuffer.length > RING_BUFFER_CAPACITY) {
      this.recentCategoryRingBuffer.shift();
    }
  }
}

export const tripleEventBroadcastEngine = new TripleEventBroadcastEngine();
