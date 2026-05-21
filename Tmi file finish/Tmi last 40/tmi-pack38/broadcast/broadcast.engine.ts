// packages/broadcast-engine/src/broadcast.engine.ts
// Manages livestreams, replays, highlights, broadcaster personalities,
// lower-thirds, commercial breaks, and fail-safe broadcast state.

export type StreamStatus = "idle" | "starting" | "live" | "ending" | "replay" | "error";

export interface StreamSession {
  id: string;
  artistId: string;
  roomId: string;
  streamKey: string;         // unique per stream, rotated after use
  ingestUrl: string;         // RTMP ingest endpoint
  playbackUrl: string;       // HLS playback URL for viewers
  replayUrl?: string;        // available after stream ends
  status: StreamStatus;
  isRecording: boolean;
  peakViewers: number;
  currentViewers: number;
  durationSeconds: number;
  startedAt?: Date;
  endedAt?: Date;
  // Broadcaster overlay
  broadcasterPersonalityId?: string;
  lowerThirdActive: boolean;
  adBreakActive: boolean;
  sponsorId?: string;
  scene: string;
  lighting: string;
}

// ── BROADCASTER PERSONALITIES ─────────────────────────────
export type BroadcasterPersonalityId =
  | "vee-jay-80"      // high energy, 80s FM, hype MC
  | "the-specialist"  // smooth, technical, cypher analyst
  | "index-prime"     // cold/digital, system announcements
  | "venue-host"      // warm, venue MC for events
  | "game-show-host"; // fast-paced, game show energy

export interface BroadcasterPersonality {
  id: BroadcasterPersonalityId;
  name: string;
  voiceStyle: string;
  triggerConditions: string[];  // when this personality activates
  scriptTemplates: {
    intro: string;
    highHype: string;           // hype > 90%
    crowdShoutout: string;      // calls out top fan
    sponsorMention: string;
    roundStart: string;
    winnerReveal: string;
    adBreak: string;
    outroStandby: string;
  };
}

export const BROADCASTER_PERSONALITIES: Record<BroadcasterPersonalityId, BroadcasterPersonality> = {
  "vee-jay-80": {
    id: "vee-jay-80",
    name: "Vee-Jay 80",
    voiceStyle: "high_energy_fm_radio",
    triggerConditions: ["cypher_start", "crown_event", "hype > 80"],
    scriptTemplates: {
      intro: "LIVE from The Musician's Index — I'm Vee-Jay 80 and this is your stage!",
      highHype: "The hype meter is at {hypePercent}%! Section {section} is GOING WILD!",
      crowdShoutout: "Shout out to {fanName} in the front row for that Mega-Tip!",
      sponsorMention: "This cypher is brought to you by {sponsorName} — stay hype!",
      roundStart: "ROUND {roundNumber} — let's GO! Clock starts NOW!",
      winnerReveal: "{winnerName} TAKES THE CROWN! {winnerName} IS YOUR CHAMPION!",
      adBreak: "We'll be right back — don't go anywhere!",
      outroStandby: "The Index never sleeps. Stay locked in.",
    },
  },
  "the-specialist": {
    id: "the-specialist",
    name: "The Specialist",
    voiceStyle: "smooth_technical",
    triggerConditions: ["battle_round", "judge_scoring", "beat_challenge"],
    scriptTemplates: {
      intro: "The Specialist here. Let's break down what we're seeing.",
      highHype: "The crowd energy is translating directly to the score — {hypePercent}% live.",
      crowdShoutout: "{fanName} has been consistent all night — that counts for something.",
      sponsorMention: "Tonight's analysis segment is supported by {sponsorName}.",
      roundStart: "Technical execution matters here. Round {roundNumber} begins.",
      winnerReveal: "The judges have spoken. {winnerName} — well earned.",
      adBreak: "Short break. Back with the breakdown.",
      outroStandby: "The Musician's Index. Where the culture lives.",
    },
  },
  "index-prime": {
    id: "index-prime",
    name: "INDEX PRIME",
    voiceStyle: "digital_system",
    triggerConditions: ["system_announcement", "crown_update", "maintenance"],
    scriptTemplates: {
      intro: "INDEX PRIME — ONLINE. Broadcasting to all terminals.",
      highHype: "HYPE THRESHOLD {hypePercent}%. NEON STORM PROTOCOL ACTIVE.",
      crowdShoutout: "UNIT {fanName} — ACKNOWLEDGED.",
      sponsorMention: "SPONSORED SEGMENT: {sponsorName}. MESSAGE BEGINS.",
      roundStart: "ROUND {roundNumber} — INITIATING.",
      winnerReveal: "COMPUTATION COMPLETE. WINNER: {winnerName}.",
      adBreak: "STANDBY MODE — COMMERCIAL SEQUENCE.",
      outroStandby: "CONNECTION STABLE. SIGNAL: 100%. LOCATION: CHICO_BASE.",
    },
  },
  "venue-host": {
    id: "venue-host",
    name: "The Venue Host",
    voiceStyle: "warm_event_mc",
    triggerConditions: ["event_start", "venue_show", "ticket_event"],
    scriptTemplates: {
      intro: "Welcome everyone! We are SO glad you're here tonight.",
      highHype: "I can feel the energy in this room — {hypePercent}% of capacity going CRAZY!",
      crowdShoutout: "{fanName}, you've been here all night — we see you!",
      sponsorMention: "A big thank you to {sponsorName} for making tonight possible.",
      roundStart: "Alright, let's get round {roundNumber} going!",
      winnerReveal: "And the winner is... {winnerName}! Congratulations!",
      adBreak: "Quick break — grab a drink and we'll be right back!",
      outroStandby: "Thank you for being here. The Index thanks you.",
    },
  },
  "game-show-host": {
    id: "game-show-host",
    name: "Game Show Host",
    voiceStyle: "fast_paced_game_show",
    triggerConditions: ["dirty_dozens", "deal_or_feud", "name_that_tune"],
    scriptTemplates: {
      intro: "WELCOME to The Musician's Index GAME WORLD — let's PLAY!",
      highHype: "OH WOW! {hypePercent}% hype — the crowd is making HISTORY!",
      crowdShoutout: "{fanName} is playing from {city}! Let's hear it!",
      sponsorMention: "Today's prize pool is sponsored by {sponsorName}!",
      roundStart: "ROUND {roundNumber}! You have {durationSeconds} seconds! GO GO GO!",
      winnerReveal: "AND THE WINNER IS... {winnerName}! {points} POINTS! AMAZING!",
      adBreak: "Station break! Back in 15!",
      outroStandby: "Thanks for playing The Musician's Index Game World!",
    },
  },
};

// ── LOWER THIRDS SYSTEM ───────────────────────────────────
export interface LowerThird {
  style: "name_title" | "breaking_news" | "sponsor" | "score_update" | "round_result" | "stat";
  line1: string;
  line2?: string;
  accentColor: string;
  durationSeconds: number;
  displayAt?: Date;          // scheduled appearance
  triggerEvent?: string;     // auto-trigger on event
}

// ── FAIL-SAFE BROADCAST STATE ────────────────────────────
// If stream drops, immediately switch to standby content
export const FAIL_SAFE_CONTENT = {
  standbyVideoUrl: "/public/standby/tmi-standby-loop.mp4",
  standbyMessage: "We'll be right back — The Index Never Sleeps",
  standbyMusic: "/public/audio/music/standby-lofi.mp3",
  testPatternUrl: "/public/standby/test-pattern.png",
  offAirScene: "off_air",
  offAirLighting: "off_air",
  retryIntervalSeconds: 10,
  maxRetries: 6,             // after 60s, switch to full standby
};
