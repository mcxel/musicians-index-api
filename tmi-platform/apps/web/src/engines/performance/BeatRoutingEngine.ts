// Beat Routing Engine — Performance Mode Authority
// Determines audio requirements for every performer class on the platform.
// Ref: TMI Performance Logic Matrix (5 modes)

export type PerformanceMode =
  | "acapella"         // voice/instrument only, no external beat
  | "beat-backed"      // external beat provided or optional
  | "instrument-only"  // instrument IS the rhythm source
  | "instrument-beat"  // instrument over external beat (hybrid)
  | "full-band";       // multi-channel live session

export type BeatSource = "none" | "internal" | "producer-submitted" | "licensed" | "live";

export type InstrumentClass =
  // Core
  | "vocalist" | "rapper" | "producer" | "guitarist" | "pianist"
  | "violinist" | "drummer" | "saxophonist" | "dj" | "beatboxer"
  | "bassist" | "songwriter" | "composer" | "band" | "choir"
  // Extended orchestral
  | "cellist" | "violist" | "bassoonist" | "trumpeter" | "trombonist"
  | "flutist" | "clarinetist" | "harpist" | "organist"
  // Global / non-western
  | "sitarist" | "oudist" | "banjoist" | "mandolinist"
  | "tabla_player" | "conguero" | "djembe_player" | "steel_drummer" | "accordionist"
  // Electronic / modern
  | "synthesist" | "mpc_producer";

export type BeatRouting = {
  mode: PerformanceMode;
  requiresBeat: boolean;
  supportsBeat: boolean;
  instrumentOnly: boolean;
  liveBandMode: boolean;
  beatSource: BeatSource;
};

const ROUTING_MAP: Record<InstrumentClass, BeatRouting> = {
  vocalist:     { mode: "beat-backed",     requiresBeat: false, supportsBeat: true,  instrumentOnly: false, liveBandMode: false, beatSource: "internal" },
  rapper:       { mode: "beat-backed",     requiresBeat: true,  supportsBeat: true,  instrumentOnly: false, liveBandMode: false, beatSource: "internal" },
  producer:     { mode: "instrument-beat", requiresBeat: true,  supportsBeat: true,  instrumentOnly: false, liveBandMode: false, beatSource: "producer-submitted" },
  guitarist:    { mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  pianist:      { mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  violinist:    { mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  drummer:      { mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  saxophonist:  { mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  dj:           { mode: "beat-backed",     requiresBeat: true,  supportsBeat: true,  instrumentOnly: false, liveBandMode: false, beatSource: "licensed" },
  beatboxer:    { mode: "acapella",        requiresBeat: false, supportsBeat: false, instrumentOnly: false, liveBandMode: false, beatSource: "live" },
  bassist:      { mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  songwriter:   { mode: "beat-backed",     requiresBeat: false, supportsBeat: true,  instrumentOnly: false, liveBandMode: false, beatSource: "internal" },
  composer:     { mode: "instrument-beat", requiresBeat: false, supportsBeat: true,  instrumentOnly: false, liveBandMode: false, beatSource: "none" },
  band:         { mode: "full-band",       requiresBeat: false, supportsBeat: false, instrumentOnly: false, liveBandMode: true,  beatSource: "live" },
  choir:        { mode: "acapella",        requiresBeat: false, supportsBeat: false, instrumentOnly: false, liveBandMode: true,  beatSource: "none" },
  // Extended orchestral
  cellist:      { mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  violist:      { mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  bassoonist:   { mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  trumpeter:    { mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  trombonist:   { mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  flutist:      { mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  clarinetist:  { mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  harpist:      { mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  organist:     { mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  // Global / non-western
  sitarist:     { mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  oudist:       { mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  banjoist:     { mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  mandolinist:  { mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  tabla_player: { mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  conguero:     { mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  djembe_player:{ mode: "instrument-only", requiresBeat: false, supportsBeat: false, instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  steel_drummer:{ mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  accordionist: { mode: "instrument-only", requiresBeat: false, supportsBeat: true,  instrumentOnly: true,  liveBandMode: false, beatSource: "none" },
  // Electronic / modern
  synthesist:   { mode: "instrument-beat", requiresBeat: false, supportsBeat: true,  instrumentOnly: false, liveBandMode: false, beatSource: "producer-submitted" },
  mpc_producer: { mode: "instrument-beat", requiresBeat: true,  supportsBeat: true,  instrumentOnly: false, liveBandMode: false, beatSource: "producer-submitted" },
};

export function getBeatRouting(role: InstrumentClass): BeatRouting {
  return ROUTING_MAP[role];
}

export function getModeLabel(mode: PerformanceMode): string {
  const labels: Record<PerformanceMode, string> = {
    "acapella":        "Acapella",
    "beat-backed":     "Beat-Backed",
    "instrument-only": "Instrument-Led",
    "instrument-beat": "Instrument + Beat",
    "full-band":       "Full Band",
  };
  return labels[mode];
}

export function getAllInstrumentClasses(): InstrumentClass[] {
  return Object.keys(ROUTING_MAP) as InstrumentClass[];
}
