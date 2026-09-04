/**
 * FanLobbyJamAudio — shared instrument jam in Fan lobbies.
 *
 * Uses the existing lobby presence propTrigger bus (Postgres lobby-sync poll,
 * not WebSocket). When any Fan equips/triggers an instrument hold, every client
 * in the room hears a local Web Audio / sound-pack hit. Not InstrumentRuntimeV2.
 *
 * Sample pack: prefer /public/sounds concert + gameshow assets; synth fallback
 * when a pack file is missing (Rule 20 honest).
 */

export type JamInstrumentKind =
  | "guitar"
  | "bass"
  | "drums"
  | "keys"
  | "sax"
  | "ukulele"
  | "boombox"
  | "generic";

const INSTRUMENT_KIND: Record<string, JamInstrumentKind> = {
  inst_acoustic_guitar: "guitar",
  inst_electric_guitar: "guitar",
  prop_neon_guitar: "guitar",
  inst_bass: "bass",
  inst_drums: "drums",
  inst_keys: "keys",
  inst_sax: "sax",
  inst_ukulele: "ukulele",
  prop_boombox: "boombox",
  boombox: "boombox",
};

/** Existing sound-pack paths (honest — files live under public/sounds). */
const SAMPLE_URL: Record<JamInstrumentKind, string | null> = {
  guitar: "/sounds/concert/concert-guitar-ident.mp3",
  bass: "/sounds/concert/concert-dark-engine-logo.mp3",
  drums: "/sounds/gameshow/gameshow-drum-roll.mp3",
  keys: "/sounds/concert/concert-intro-studio.mp3",
  sax: "/sounds/concert/concert-stinger.mp3",
  ukulele: "/sounds/concert/concert-guitar-ident.mp3",
  boombox: "/sounds/concert/concert-intro-trap.mp3",
  generic: "/sounds/crowd/crowd-small-reactions.mp3",
};

const SYNTH_HZ: Record<JamInstrumentKind, number[]> = {
  guitar: [196, 247, 294],
  bass: [82, 110],
  drums: [60, 180],
  keys: [262, 330, 392],
  sax: [349, 440],
  ukulele: [392, 494],
  boombox: [110, 165, 220],
  generic: [440],
};

let sharedCtx: AudioContext | null = null;
const audioCache = new Map<string, HTMLAudioElement>();
const missingSamples = new Set<string>();
const lastPlayByKey = new Map<string, number>();
const DEBOUNCE_MS = 280;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    sharedCtx = new Ctor();
  }
  if (sharedCtx.state === "suspended") void sharedCtx.resume();
  return sharedCtx;
}

export function isInstrumentPropId(propId: string | null | undefined): boolean {
  if (!propId || propId === "none") return false;
  if (INSTRUMENT_KIND[propId]) return true;
  return propId.startsWith("inst_") || propId.includes("guitar") || propId === "prop_boombox";
}

export function resolveJamKind(propId: string): JamInstrumentKind {
  return INSTRUMENT_KIND[propId] ?? (propId.startsWith("inst_") ? "generic" : "generic");
}

function playSynth(kind: JamInstrumentKind): void {
  const ctx = getCtx();
  if (!ctx) return;
  const freqs = SYNTH_HZ[kind] ?? SYNTH_HZ.generic;
  freqs.forEach((hz, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = kind === "drums" ? "square" : kind === "bass" ? "sawtooth" : "triangle";
    const t0 = ctx.currentTime + i * 0.04;
    osc.frequency.setValueAtTime(hz, t0);
    gain.gain.setValueAtTime(0.07, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.36);
  });
}

function playSample(url: string, kind: JamInstrumentKind): void {
  if (missingSamples.has(url)) {
    playSynth(kind);
    return;
  }
  let el = audioCache.get(url);
  if (!el) {
    el = new Audio(url);
    el.preload = "auto";
    el.volume = 0.45;
    el.onerror = () => {
      missingSamples.add(url);
      playSynth(kind);
    };
    audioCache.set(url, el);
  }
  try {
    el.currentTime = 0;
    void el.play().catch(() => playSynth(kind));
  } catch {
    playSynth(kind);
  }
}

/** Play one jam hit for a prop id (local Web Audio / sound pack). */
export function playInstrumentJamHit(propId: string, debounceKey?: string): void {
  if (!isInstrumentPropId(propId)) return;
  const key = debounceKey ?? propId;
  const now = Date.now();
  const last = lastPlayByKey.get(key) ?? 0;
  if (now - last < DEBOUNCE_MS) return;
  lastPlayByKey.set(key, now);

  const kind = resolveJamKind(propId);
  const url = SAMPLE_URL[kind];
  if (url) playSample(url, kind);
  else playSynth(kind);
}

/**
 * Diff peer propTriggers and play new instrument holds so the room hears
 * each other's jam (bounded by lobby-sync poll interval — honest latency).
 */
export function syncLobbyJamFromPresence(args: {
  selfPropTrigger: string;
  peerPropTriggers: Array<{ userId: string; propTrigger: string }>;
  prevMap: Map<string, string>;
}): Map<string, string> {
  const next = new Map<string, string>();
  const all = [
    { userId: "__self__", propTrigger: args.selfPropTrigger },
    ...args.peerPropTriggers,
  ];
  for (const row of all) {
    const prop = row.propTrigger || "none";
    next.set(row.userId, prop);
    const prev = args.prevMap.get(row.userId) ?? "none";
    if (prop !== prev && isInstrumentPropId(prop)) {
      playInstrumentJamHit(prop, `${row.userId}:${prop}`);
    }
  }
  return next;
}
