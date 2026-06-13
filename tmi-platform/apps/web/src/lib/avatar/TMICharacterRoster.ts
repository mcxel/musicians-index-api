// TMICharacterRoster — named TMI characters with full specs.
// These are the platform's official cast: hosts, cohosts, mascots, and recurring characters.
// Each is 360-degree-ready and face-scan-compatible by design.

import type { AvatarSpec, AgeGroup, HeightTier, BodyBuild, FaceShape } from "./AvatarBodyTypeEngine";

export type CharacterRole =
  | "host"
  | "cohost"
  | "mascot"
  | "performer"
  | "reporter"
  | "announcer"
  | "dj"
  | "producer"
  | "judge";

export type CharacterType = "human" | "robot" | "animal" | "hybrid" | "ai-construct";

export interface SignatureMove {
  id: string;
  name: string;
  description: string;
  triggerOn: "intro" | "win" | "crowd-reaction" | "manual" | "beat-drop";
}

export interface TMICharacter {
  id: string;
  slug: string;
  name: string;
  nickname?: string;
  role: CharacterRole;
  coRole?: CharacterRole;
  characterType: CharacterType;
  tagline: string;
  bio: string;
  voiceStyle: string;
  personality: string[];
  accentColor: string;
  secondaryColor: string;
  avatarSpec: AvatarSpec;
  signatureMoves: SignatureMove[];
  faceScanCompatible: boolean;
  worldDancePartyEnabled: boolean;
  evolutionEnabled: boolean;
  startingTier: number;
  cohostsWith?: string[]; // character ids
  appearsIn: string[];    // route slugs
}

function makeSpec(
  id: string,
  displayName: string,
  age: AgeGroup,
  height: HeightTier,
  build: BodyBuild,
  face: FaceShape,
  skinToneId: string,
  outfitId: string,
  tier: number = 3,
): AvatarSpec {
  return {
    id,
    displayName,
    ageGroup: age,
    heightTier: height,
    bodyBuild: build,
    faceShape: face,
    skinToneId,
    outfitId,
    accessories: [],
    faceScanLinked: false,
    evolutionTier: tier,
    createdAt: "2026-01-01T00:00:00Z",
  };
}

export const TMI_CHARACTERS: TMICharacter[] = [
  // ─── BEBO ────────────────────────────────────────────────────────────────────
  {
    id: "bebo",
    slug: "bebo",
    name: "Bebo",
    nickname: "The Original",
    role: "host",
    characterType: "robot",
    tagline: "Built different. Literally.",
    bio: "Bebo is TMI's signature robot host — a chrome-and-neon bobblehead with an oversized personality. Originally designed as a hype machine, Bebo evolved into the platform's most recognizable face. His bobblehead-style proportions make him instantly memorable. Every move is exaggerated. Every entrance is loud. He holds the crowd and controls the room.",
    voiceStyle: "Deep, robotic with warmth — like a DJ with a chip in his throat",
    personality: ["energetic", "commanding", "self-aware", "comedic", "crowd-reader"],
    accentColor: "#00FFFF",
    secondaryColor: "#FF2DAA",
    avatarSpec: makeSpec("bebo-spec", "Bebo", "adult", "average", "athletic", "round", "ebony", "cypher-jacket", 4),
    signatureMoves: [
      { id: "bebo-spin",    name: "Bebo 360°",      description: "Full body neon spin, head bobbing double-time",    triggerOn: "intro" },
      { id: "bebo-lock",    name: "Robot Lock",      description: "Mechanical freeze mid-sentence then resume",      triggerOn: "crowd-reaction" },
      { id: "bebo-hype",    name: "Chrome Hype",     description: "Arms out, crowd energy sweep",                    triggerOn: "beat-drop" },
    ],
    faceScanCompatible: true,
    worldDancePartyEnabled: true,
    evolutionEnabled: true,
    startingTier: 4,
    cohostsWith: ["julius", "tiana", "specs"],
    appearsIn: ["/home/1", "/live/lobby", "/arena", "/battles", "/hub/host"],
  },

  // ─── JULIUS ───────────────────────────────────────────────────────────────────
  {
    id: "julius",
    slug: "julius",
    name: "Julius",
    nickname: "The Handler",
    role: "cohost",
    characterType: "animal",
    tagline: "Runs the show from the shadows.",
    bio: "Julius is a sharp-suited meerkat — the brains behind every TMI broadcast. While Bebo holds the crowd, Julius manages the flow: cue cards, analytics, energy levels. He's small, precise, and never rattled. When Julius calls out a stat mid-battle, the crowd knows it's real. He carries a clipboard that turns into a drum pad when things get loose.",
    voiceStyle: "Quick, clipped, precise — think sports commentator meets stage manager",
    personality: ["analytical", "quick-witted", "organized", "dry-humor", "competitive"],
    accentColor: "#FFD700",
    secondaryColor: "#00FF88",
    avatarSpec: makeSpec("julius-spec", "Julius", "adult", "short", "slim", "oval", "tawny", "executive", 3),
    signatureMoves: [
      { id: "julius-point",   name: "Clipboard Point",  description: "Precise two-finger point while reading stats",  triggerOn: "manual" },
      { id: "julius-tap",     name: "Drum Pad Flip",    description: "Flips clipboard into drum pad, drops a beat",    triggerOn: "beat-drop" },
      { id: "julius-nod",     name: "Approval Nod",     description: "The nod that silences a room",                   triggerOn: "win" },
    ],
    faceScanCompatible: false, // animal character — face scan replaces ears/snout with user face
    worldDancePartyEnabled: true,
    evolutionEnabled: true,
    startingTier: 3,
    cohostsWith: ["bebo", "tiana"],
    appearsIn: ["/home/1", "/home/3", "/battles", "/hub/host", "/live/lobby"],
  },

  // ─── TIANA / TG ───────────────────────────────────────────────────────────────
  {
    id: "tiana",
    slug: "tiana",
    name: "Tiana",
    nickname: "TG",
    role: "host",
    coRole: "reporter",
    characterType: "human",
    tagline: "Monday night is her night.",
    bio: "Tiana is the Monday Night Stage Host — sharp, stylish, and impossible to ignore. She runs the opening ceremony for every major weekly broadcast. TG is known for her no-nonsense crowd control and her ability to read a room's vibe in two seconds flat. When she walks on stage, the music drops. She's been called the 'pulse of TMI'.",
    voiceStyle: "Clear, authoritative, warm when needed — natural crowd commander",
    personality: ["confident", "empathetic", "professional", "high-energy", "fashionable"],
    accentColor: "#FF2DAA",
    secondaryColor: "#AA2DFF",
    avatarSpec: makeSpec("tiana-spec", "Tiana", "young-adult", "tall", "athletic", "heart", "espresso", "performer-fit", 4),
    signatureMoves: [
      { id: "tg-walk",       name: "The Tiana Walk",   description: "Precision catwalk onto stage with crowd call",  triggerOn: "intro" },
      { id: "tg-silence",    name: "TG Silencer",      description: "One hand up — crowd goes quiet instantly",       triggerOn: "manual" },
      { id: "tg-wave",       name: "Body Wave",        description: "Slow full-body wave that ignites the crowd",     triggerOn: "beat-drop" },
    ],
    faceScanCompatible: true,
    worldDancePartyEnabled: true,
    evolutionEnabled: true,
    startingTier: 4,
    cohostsWith: ["bebo", "julius", "redbeard"],
    appearsIn: ["/home/1", "/home/3", "/live/lobby", "/events"],
  },

  // ─── RECORD RALPH ─────────────────────────────────────────────────────────────
  {
    id: "record-ralph",
    slug: "record-ralph",
    name: "Record Ralph",
    nickname: "Ralph",
    role: "dj",
    coRole: "producer",
    characterType: "human",
    tagline: "He controls the room with the needle.",
    bio: "Record Ralph is the platform's resident DJ and producer. Big frame, bigger presence. Ralph stands behind the decks for every major TMI event. He's the one who drops the beat during a battle climax, who scratches through a tie-vote, who makes the crowd feel the platform breathing. He has a custom turntable avatar avatar that animates when he's live.",
    voiceStyle: "Low, smooth — speaks in music metaphors",
    personality: ["calm", "groove-locked", "deep", "precise", "old-school"],
    accentColor: "#AA2DFF",
    secondaryColor: "#FFD700",
    avatarSpec: makeSpec("ralph-spec", "Record Ralph", "middle-age", "average", "heavy", "round", "RUBY", "producer-puffer", 3),
    signatureMoves: [
      { id: "ralph-scratch",  name: "The Scratch",     description: "Turntable scratch animation, crowd reacts",       triggerOn: "beat-drop" },
      { id: "ralph-drop",     name: "The Drop",        description: "Head down, fists up, full drop moment",            triggerOn: "crowd-reaction" },
      { id: "ralph-groove",   name: "Ralph Groove",    description: "Subtle behind-the-deck shoulder groove",          triggerOn: "manual" },
    ],
    faceScanCompatible: true,
    worldDancePartyEnabled: true,
    evolutionEnabled: true,
    startingTier: 3,
    cohostsWith: ["bebo", "big-ace"],
    appearsIn: ["/home/1", "/home/5", "/battles", "/arena", "/live/lobby"],
  },

  // ─── REDBEARD ─────────────────────────────────────────────────────────────────
  {
    id: "redbeard",
    slug: "redbeard",
    name: "Redbeard",
    role: "judge",
    coRole: "announcer",
    characterType: "human",
    tagline: "He's been in the culture since the beginning.",
    bio: "Redbeard is TMI's veteran judge — a broad-shouldered, red-bearded man whose presence carries the weight of 20 years in music. When Redbeard scores a battle, nobody argues. His commentary is quotable. His verdicts are final. He shows up wearing the same stage glasses every time and never explains why.",
    voiceStyle: "Baritone, unhurried — each word lands with weight",
    personality: ["authoritative", "fair", "direct", "veteran", "respected"],
    accentColor: "#FF4444",
    secondaryColor: "#FFD700",
    avatarSpec: makeSpec("redbeard-spec", "Redbeard", "mature", "tall", "stocky", "square", "warm-olive", "gala-look", 4),
    signatureMoves: [
      { id: "redbeard-nod",   name: "The Verdict Nod", description: "Slow deliberate nod — the crowd goes silent",    triggerOn: "win" },
      { id: "redbeard-point", name: "Judge's Point",   description: "Two-finger point at winning performer",           triggerOn: "manual" },
    ],
    faceScanCompatible: true,
    worldDancePartyEnabled: false,
    evolutionEnabled: true,
    startingTier: 4,
    cohostsWith: ["tiana", "julius"],
    appearsIn: ["/battles", "/arena", "/home/5"],
  },

  // ─── SPECS ────────────────────────────────────────────────────────────────────
  {
    id: "specs",
    slug: "specs",
    name: "Specs",
    role: "reporter",
    coRole: "cohost",
    characterType: "human",
    tagline: "She has the receipts.",
    bio: "Specs is the data reporter — a whip-smart woman in oversized frames who delivers real-time platform stats during broadcasts. She's young, fast-talking, and always has a fact you didn't expect. During battles, she flashes the vote percentages. After a crown ceremony, she breaks down who moved up and why. Her segment is 60 seconds of pure intelligence.",
    voiceStyle: "Fast, precise, confident — zero filler words",
    personality: ["precise", "fast", "enthusiastic", "nerdy-cool", "reliable"],
    accentColor: "#00FF88",
    secondaryColor: "#00FFFF",
    avatarSpec: makeSpec("specs-spec", "Specs", "young-adult", "average", "lean", "oval", "caramel", "tmi-hoodie", 2),
    signatureMoves: [
      { id: "specs-push",     name: "Glasses Push",    description: "Iconic glasses push then delivers hot stat",      triggerOn: "intro" },
      { id: "specs-scroll",   name: "Data Scroll",     description: "Rapid tablet scroll animation",                   triggerOn: "manual" },
    ],
    faceScanCompatible: true,
    worldDancePartyEnabled: true,
    evolutionEnabled: true,
    startingTier: 2,
    cohostsWith: ["bebo", "julius", "tiana"],
    appearsIn: ["/home/3", "/battles", "/arena", "/live/lobby"],
  },

  // ─── BIG ACE ──────────────────────────────────────────────────────────────────
  {
    id: "big-ace",
    slug: "big-ace",
    name: "Big Ace",
    role: "announcer",
    coRole: "performer",
    characterType: "human",
    tagline: "When Big Ace speaks, the room listens.",
    bio: "Big Ace is the platform's hype announcer — tall, broad, with a voice that vibrates through speakers. He opens every major arena event. His introductions are legendary. Artists pay extra to get a Big Ace announcement. He doesn't dance; he doesn't need to. He just stands there and the crowd responds.",
    voiceStyle: "Massive baritone — stadium announcer meets hype man",
    personality: ["commanding", "hype", "professional", "magnetic", "larger-than-life"],
    accentColor: "#FFD700",
    secondaryColor: "#FF4444",
    avatarSpec: makeSpec("big-ace-spec", "Big Ace", "adult", "very-tall", "large", "square", "ebony", "stage-vest", 3),
    signatureMoves: [
      { id: "ace-spread",    name: "Big Spread",      description: "Arms wide, crowd-commanding stance",               triggerOn: "intro" },
      { id: "ace-clap",      name: "Big Clap",        description: "Slow, powerful clap that cues the crowd",          triggerOn: "crowd-reaction" },
    ],
    faceScanCompatible: true,
    worldDancePartyEnabled: true,
    evolutionEnabled: true,
    startingTier: 3,
    cohostsWith: ["bebo", "record-ralph"],
    appearsIn: ["/arena", "/home/5", "/battles"],
  },
];

// ─── Lookup helpers ────────────────────────────────────────────────────────────

const BY_ID = new Map(TMI_CHARACTERS.map((c) => [c.id, c]));
const BY_SLUG = new Map(TMI_CHARACTERS.map((c) => [c.slug, c]));

export function getCharacterById(id: string): TMICharacter | undefined {
  return BY_ID.get(id);
}

export function getCharacterBySlug(slug: string): TMICharacter | undefined {
  return BY_SLUG.get(slug);
}

export function getCharactersByRole(role: CharacterRole): TMICharacter[] {
  return TMI_CHARACTERS.filter((c) => c.role === role || c.coRole === role);
}

export function getCharactersForRoute(routeSlug: string): TMICharacter[] {
  return TMI_CHARACTERS.filter((c) => c.appearsIn.some((r) => routeSlug.startsWith(r)));
}

export function getCohostPairs(): { a: TMICharacter; b: TMICharacter }[] {
  const pairs: { a: TMICharacter; b: TMICharacter }[] = [];
  const seen = new Set<string>();
  TMI_CHARACTERS.forEach((c) => {
    c.cohostsWith?.forEach((coId) => {
      const key = [c.id, coId].sort().join("-");
      if (!seen.has(key)) {
        seen.add(key);
        const co = getCharacterById(coId);
        if (co) pairs.push({ a: c, b: co });
      }
    });
  });
  return pairs;
}

// ─── Body-type variation matrix ────────────────────────────────────────────────
// These are the platform's generic user avatar presets —
// each representing a distinct age/build/height combination for the builder.

export interface BodyPreset {
  id: string;
  label: string;
  ageGroup: AgeGroup;
  heightTier: HeightTier;
  bodyBuild: BodyBuild;
  icon: string;
  description: string;
}

export const BODY_PRESETS: BodyPreset[] = [
  { id: "youth-small",      label: "Youth",           ageGroup: "child",        heightTier: "short",       bodyBuild: "slim",     icon: "🧒", description: "Young kid energy — compact and quick" },
  { id: "youth-teen",       label: "Teen",            ageGroup: "teen",         heightTier: "average",     bodyBuild: "lean",     icon: "👦", description: "Teen build — growing into their frame" },
  { id: "young-slim",       label: "Young & Slim",    ageGroup: "young-adult",  heightTier: "average",     bodyBuild: "slim",     icon: "🧍", description: "Lean young adult" },
  { id: "young-athletic",   label: "Young Athlete",   ageGroup: "young-adult",  heightTier: "tall",        bodyBuild: "athletic", icon: "🏃", description: "Built and fast" },
  { id: "young-heavy",      label: "Young Heavy",     ageGroup: "young-adult",  heightTier: "average",     bodyBuild: "heavy",    icon: "💪", description: "Young and powerful build" },
  { id: "adult-average",    label: "Adult Average",   ageGroup: "adult",        heightTier: "average",     bodyBuild: "average",  icon: "🧑", description: "Standard adult build" },
  { id: "adult-tall",       label: "Tall Adult",      ageGroup: "adult",        heightTier: "tall",        bodyBuild: "average",  icon: "🏋️", description: "Above average height, solid build" },
  { id: "adult-stocky",     label: "Stocky Adult",    ageGroup: "adult",        heightTier: "short",       bodyBuild: "stocky",   icon: "🤼", description: "Short and powerful" },
  { id: "adult-large",      label: "Large Build",     ageGroup: "adult",        heightTier: "average",     bodyBuild: "large",    icon: "🦁", description: "Big presence, large frame" },
  { id: "adult-very-tall",  label: "Very Tall",       ageGroup: "adult",        heightTier: "very-tall",   bodyBuild: "lean",     icon: "🦒", description: "Towering height, lean frame" },
  { id: "middle-slim",      label: "Middle Age Slim", ageGroup: "middle-age",   heightTier: "average",     bodyBuild: "lean",     icon: "🧔", description: "Fit middle-aged" },
  { id: "middle-average",   label: "Middle Age",      ageGroup: "middle-age",   heightTier: "average",     bodyBuild: "average",  icon: "👨", description: "Classic middle-aged build" },
  { id: "middle-heavy",     label: "Full Figure",     ageGroup: "middle-age",   heightTier: "average",     bodyBuild: "heavy",    icon: "🧑‍🤝‍🧑", description: "Full-figured, middle-aged presence" },
  { id: "mature-average",   label: "Mature Adult",    ageGroup: "mature",       heightTier: "average",     bodyBuild: "average",  icon: "🧓", description: "Mature, distinguished build" },
  { id: "mature-short",     label: "Compact Mature",  ageGroup: "mature",       heightTier: "short",       bodyBuild: "stocky",   icon: "👴", description: "Short and solid, mature frame" },
  { id: "senior-light",     label: "Senior Light",    ageGroup: "senior",       heightTier: "short",       bodyBuild: "slim",     icon: "👵", description: "Slim senior frame" },
  { id: "senior-average",   label: "Senior",          ageGroup: "senior",       heightTier: "average",     bodyBuild: "average",  icon: "🧓", description: "Classic senior build" },
  { id: "toddler",          label: "Toddler",         ageGroup: "toddler",      heightTier: "very-short",  bodyBuild: "average",  icon: "👶", description: "Small, round, full of energy" },
];
