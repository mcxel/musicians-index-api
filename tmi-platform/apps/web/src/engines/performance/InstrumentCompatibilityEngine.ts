// Instrument Compatibility Engine — Battle + Cypher matchup authority
// Rules: same-role direct battle, cross-role optional (premium), cypher class groupings

import type { InstrumentClass } from "./BeatRoutingEngine";

// ── Direct battle — same discipline only ──────────────────────────────────────

const DIRECT_MATCHUPS: Partial<Record<InstrumentClass, InstrumentClass[]>> = {
  vocalist:     ["vocalist"],
  rapper:       ["rapper"],
  producer:     ["producer"],
  guitarist:    ["guitarist"],
  pianist:      ["pianist"],
  violinist:    ["violinist"],
  drummer:      ["drummer"],
  saxophonist:  ["saxophonist"],
  dj:           ["dj"],
  beatboxer:    ["beatboxer"],
  bassist:      ["bassist"],
  songwriter:   ["songwriter"],
  composer:     ["composer"],
  band:         ["band"],
  choir:        ["choir"],
  // Extended orchestral
  cellist:      ["cellist"],
  violist:      ["violist"],
  bassoonist:   ["bassoonist"],
  trumpeter:    ["trumpeter"],
  trombonist:   ["trombonist"],
  flutist:      ["flutist"],
  clarinetist:  ["clarinetist"],
  harpist:      ["harpist"],
  organist:     ["organist"],
  // Global / non-western
  sitarist:     ["sitarist"],
  oudist:       ["oudist"],
  banjoist:     ["banjoist"],
  mandolinist:  ["mandolinist"],
  tabla_player: ["tabla_player"],
  conguero:     ["conguero"],
  djembe_player:["djembe_player"],
  steel_drummer:["steel_drummer"],
  accordionist: ["accordionist"],
  // Electronic / modern
  synthesist:   ["synthesist"],
  mpc_producer: ["mpc_producer"],
};

// ── Cross-role mode — premium only ───────────────────────────────────────────

const CROSS_ROLE_MATCHUPS: Partial<Record<InstrumentClass, InstrumentClass[]>> = {
  vocalist:     ["rapper", "songwriter"],
  guitarist:    ["bassist", "pianist", "violinist", "banjoist", "mandolinist", "oudist"],
  pianist:      ["guitarist", "violinist", "saxophonist", "organist", "harpist"],
  violinist:    ["pianist", "guitarist", "saxophonist", "cellist", "violist"],
  producer:     ["dj", "beatboxer", "synthesist", "mpc_producer"],
  rapper:       ["vocalist", "beatboxer"],
  drummer:      ["tabla_player", "conguero", "djembe_player", "steel_drummer"],
  saxophonist:  ["clarinetist", "flutist", "trumpeter", "trombonist", "bassoonist"],
  cellist:      ["violinist", "violist", "bassist"],
  synthesist:   ["producer", "mpc_producer", "dj"],
};

// ── Cypher class groupings — community circle format ──────────────────────────

export const CYPHER_CLASSES: Record<string, InstrumentClass[]> = {
  "Vocal Cypher":    ["vocalist", "rapper", "songwriter", "beatboxer", "choir"],
  "String Cypher":   ["guitarist", "bassist", "violinist", "cellist", "violist", "banjoist", "mandolinist", "oudist", "sitarist", "harpist"],
  "Keys Cypher":     ["pianist", "composer", "organist", "accordionist"],
  "Rhythm Cypher":   ["drummer", "beatboxer", "dj", "tabla_player", "conguero", "djembe_player", "steel_drummer"],
  "Wind Cypher":     ["saxophonist", "flutist", "clarinetist", "trumpeter", "trombonist", "bassoonist"],
  "Producer Cypher": ["producer", "composer", "dj", "synthesist", "mpc_producer"],
  "Band Cypher":     ["band"],
  "World Cypher":    ["sitarist", "oudist", "tabla_player", "djembe_player", "steel_drummer", "accordionist"],
  "Open Cypher":     ["vocalist", "rapper", "guitarist", "pianist", "producer", "drummer"],
};

// ── Public API ────────────────────────────────────────────────────────────────

export function isValidDirectBattle(role1: InstrumentClass, role2: InstrumentClass): boolean {
  return DIRECT_MATCHUPS[role1]?.includes(role2) ?? false;
}

export function isValidCrossRoleBattle(role1: InstrumentClass, role2: InstrumentClass): boolean {
  return CROSS_ROLE_MATCHUPS[role1]?.includes(role2) ?? false;
}

export function getBattleLabel(role: InstrumentClass): string {
  const labels: Partial<Record<InstrumentClass, string>> = {
    vocalist:     "Singer Battle",
    rapper:       "Rap Battle",
    producer:     "Producer Battle",
    guitarist:    "Guitar Battle",
    pianist:      "Piano Battle",
    violinist:    "Violin Battle",
    drummer:      "Drum Battle",
    saxophonist:  "Sax Battle",
    dj:           "DJ Battle",
    beatboxer:    "Beatbox Battle",
    bassist:      "Bass Battle",
    songwriter:   "Songwriter Battle",
    composer:     "Composer Battle",
    band:         "Band Battle",
    choir:        "Choir Battle",
    cellist:      "Cello Battle",
    violist:      "Viola Battle",
    bassoonist:   "Bassoon Battle",
    trumpeter:    "Trumpet Battle",
    trombonist:   "Trombone Battle",
    flutist:      "Flute Battle",
    clarinetist:  "Clarinet Battle",
    harpist:      "Harp Battle",
    organist:     "Organ Battle",
    sitarist:     "Sitar Battle",
    oudist:       "Oud Battle",
    banjoist:     "Banjo Battle",
    mandolinist:  "Mandolin Battle",
    tabla_player: "Tabla Battle",
    conguero:     "Conga Battle",
    djembe_player:"Djembe Battle",
    steel_drummer:"Steel Drum Battle",
    accordionist: "Accordion Battle",
    synthesist:   "Synth Battle",
    mpc_producer: "MPC Battle",
  };
  return labels[role] ?? "Music Battle";
}

export function getCypherClassFor(role: InstrumentClass): string {
  for (const [className, roles] of Object.entries(CYPHER_CLASSES)) {
    if (roles.includes(role)) return className;
  }
  return "Open Cypher";
}

export function getCypherLabel(genre: string, instrumentClass: string): string {
  if (instrumentClass && instrumentClass !== "Open Cypher") return instrumentClass;
  return `${genre} Cypher`;
}
